from .conscious_core_import import Any, Dict, List, Optional, Union
import threading

__FOC_STREAM_LOCK = threading.RLock()

def _now() -> str:
    """Return current UTC time as ISO string, with microseconds."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")

def _get_json_module(prefer: Optional[str] = None):
    """Flexibly select a JSON module by preference and fallback."""
    modules = []
    if prefer is not None:
        modules.append(prefer)
    modules += ["json5", "ujson", "orjson", "json"]
    for mod in modules:
        try:
            return __import__(mod)
        except ImportError:
            continue
    raise ImportError("No suitable JSON module installed.")

def save_json(
    fname: str,
    data: Any,
    audit: bool = False,
    audit_metadata: Optional[Dict[str, Any]] = None,
    json_mode: Optional[str] = None,
    backup: bool = True,
    compress: bool = False,
    custom_encoder: Optional[Any] = None,
) -> None:
    """
    Atomically save JSON data to a file, optionally with audit, backup, and compression.
    Args:
        fname: Target file name
        data: Data to save
        audit: Whether to append audit log
        audit_metadata: Additional audit metadata dict
        json_mode: Prefer JSON module name ("json5","ujson","orjson","json")
        backup: Save previous file as backup
        compress: Compress output as .gz
        custom_encoder: Custom JSONEncoder subclass or function
    """
    from pathlib import Path
    import os
    import shutil

    fp = Path(fname).expanduser().absolute()
    tmpf = fp.with_suffix(fp.suffix + ".tmp")
    if backup and fp.exists():
        fp_bak = fp.with_suffix(fp.suffix + ".bak")
        shutil.copyfile(str(fp), str(fp_bak))

    json_module = _get_json_module(json_mode)
    write_kwargs = {"ensure_ascii": False, "indent": 2}

    def encode_data(obj):
        if custom_encoder is not None:
            return custom_encoder(obj)
        if hasattr(json_module, "dumps"):
            return json_module.dumps(obj, **write_kwargs)
        return obj

    out_data = data
    if hasattr(json_module, "dump"):
        open_mode = "wt" if not compress else "wt"
        if compress:
            import gzip
            with gzip.open(tmpf, open_mode, encoding="utf-8") as f:
                json_module.dump(out_data, f, **write_kwargs)
        else:
            with tmpf.open(open_mode, encoding="utf-8") as f:
                json_module.dump(out_data, f, **write_kwargs)
    elif hasattr(json_module, "dumps"):
        text = encode_data(out_data)
        if compress:
            import gzip
            with gzip.open(tmpf, "wt", encoding="utf-8") as f:
                f.write(text)
        else:
            with tmpf.open("w", encoding="utf-8") as f:
                f.write(text)
    os.replace(str(tmpf), str(fp))

    if audit:
        audit_fp = fp.with_suffix(fp.suffix + ".audit.txt")
        base_note = f"{_now()} :: update by save_json({fname})"
        mdstr = ""
        if audit_metadata:
            mdstr = " | " + "; ".join(f"{k}={v}" for k, v in audit_metadata.items())
        with audit_fp.open("a", encoding="utf-8") as af:
            af.write(base_note + mdstr + "\n")

def load_json(
    fname: str,
    default: Any = None,
    validator: Optional[Any] = None,
    json_mode: Optional[str] = None,
    fail_on_error: bool = False,
    as_dict: bool = True,
    decompress: bool = False,
    postprocess: Optional[Any] = None,
) -> Any:
    """
    Load JSON from disk, support auto module, validation, decompression, and postprocessing.
    """
    import os
    fname = os.path.expanduser(fname)
    json_module = _get_json_module(json_mode)
    open_fname = fname
    decompress_flag = decompress
    if not decompress and fname.endswith(".gz"):
        decompress_flag = True

    try:
        open_func = open
        open_mode = "r"
        if decompress_flag:
            import gzip
            open_func = gzip.open
            open_mode = "rt"
        with open_func(open_fname, open_mode, encoding="utf-8") as f:
            data = json_module.load(f)
            if validator:
                validator(data)
            if postprocess:
                data = postprocess(data)
            return data
    except Exception as e:
        if fail_on_error:
            raise e
        return default

def _validate_focus(data: Any) -> None:
    """
    Validate structure, types, value integrity of focus stream. Extended: checks tags, audit, last_updated.
    """
    if data is None:
        return
    if not isinstance(data, dict):
        raise ValueError("Focus stream data must be a dictionary")
    cur = data.get("current_focus", [])
    if not isinstance(cur, list):
        raise ValueError("current_focus must be a list")
    tags = data.get("tags", [])
    if not isinstance(tags, list):
        raise ValueError("tags must be a list")
    audit = data.get("audit", {})
    if not isinstance(audit, dict):
        raise ValueError("audit must be a dictionary")
    last_updated = data.get("last_updated", None)
    if last_updated is not None and not isinstance(last_updated, str):
        raise ValueError("last_updated must be a string")
    # Additional extensible schema checks...
    # Each focus item supports strings, dicts, or nested structures
    for f in cur:
        if not (isinstance(f, str) or isinstance(f, dict)):
            raise ValueError("Each focus item must be a string or dict")

class FocusStreamController:
    """
    Manage multi-agent, multi-layer focus streams.
    Features:
        - Multiple Users/Agents
        - Streams by tags, context, priority, version
        - History, undo, timelines
        - Layered/Hierarchical stream support
        - Merging, diff, patching, subscriptions, listeners
        - Bulk ops: add/remove/set/clear/mutate items
        - On-the-fly audit, analytics, replay
    """
    _STORAGE = "focus_stream.json"
    _LOCK = threading.RLock()

    @classmethod
    def set_focus_stream(
        cls,
        focus_items: List[Union[str, Dict]],
        user: Optional[str] = None,
        stream_tags: Optional[List[str]] = None,
        audit_note: str = "set_focus",
        custom_fields: Optional[Dict[str, Any]] = None,
        archive: bool = True,
        priority: Optional[int] = None,
        version: Optional[str] = None,
        context: Optional[str] = None,
    ) -> None:
        """
        Set or update the current focus stream (multi-agent, auditable, versionable).
        Args are extensible via custom_fields for AGI e.g. XAI, context, etc.
        """
        now = _now()
        with cls._LOCK:
            prev = cls.get_full_stream()
            data = {
                "current_focus": focus_items,
                "last_updated": now,
                "updated_by": user or "system",
                "tags": stream_tags or [],
                "audit": {
                    "event": audit_note,
                    "timestamp": now
                },
                "history": prev.get("history", []),
                "priority": priority,
                "context": context or "",
                "version": version or "1.0.0"
            }
            if custom_fields:
                data.update(custom_fields)
            # Update history (short timeline)
            hist_entry = {
                "when": now,
                "who": user or "system",
                "note": audit_note,
                "focus": focus_items,
                "tags": stream_tags or [],
                "version": data["version"],
            }
            data["history"] = prev.get("history", []) + [hist_entry]
            save_json(cls._STORAGE, data, audit=True, audit_metadata={"user": user, "audit_note": audit_note})
            if archive:
                # Save historical archive
                arc_path = f"{cls._STORAGE}.{now.replace(':','-').replace('.','_')}.archive.json"
                save_json(arc_path, data, audit=False)

    @classmethod
    def get_focus_stream(
        cls,
        stream_filter: Optional[Any] = None,
        only_active: bool = True,
        filter_tags: Optional[List[str]] = None,
        min_priority: Optional[int] = None,
        since: Optional[str] = None,
        with_history: bool = False,
        custom_filter: Optional[Any] = None,
    ) -> Any:
        """
        Retrieve latest focus stream, with flexible filtering and option for histories, priorities, tags.
        """
        d = load_json(cls._STORAGE, default={}, validator=_validate_focus)
        cur = d.get("current_focus", [])
        if filter_tags:
            cur = [f for f in cur if isinstance(f, dict) and ("tags" in f and any(t in f["tags"] for t in filter_tags))]
        if min_priority is not None:
            cur = [f for f in cur if isinstance(f, dict) and f.get("priority", 0) >= min_priority]
        if stream_filter:
            cur = stream_filter(cur)
        if custom_filter:
            cur = custom_filter(cur)
        if since and 'history' in d:
            cur = [
                f for f in cur
                if any(h.get("when", "") >= since for h in d["history"] if "focus" in h and f in h["focus"])
            ]
        if with_history:
            return {"current_focus": cur, "history": d.get("history", [])}
        return cur

    @classmethod
    def clear_focus_stream(cls, audit_note: str = "clear_focus", archive: bool = True, user: Optional[str] = None) -> None:
        """
        Erase the active focus stream, with audit, backup, and timeline-friendly tracking.
        """
        with cls._LOCK:
            d = cls.get_full_stream()
            now = _now()
            hist_entry = {
                "when": now,
                "who": user or "system",
                "note": audit_note,
                "focus": [],
                "tags": [],
                "version": d.get("version", "1.0.0"),
            }
            cleared = {
                "current_focus": [],
                "last_updated": now,
                "updated_by": user or "system",
                "tags": [],
                "audit": {
                    "event": audit_note,
                    "timestamp": now
                },
                "history": d.get("history", []) + [hist_entry],
                "priority": d.get("priority"),
                "context": d.get("context"),
                "version": d.get("version", "1.0.0"),
            }
            save_json(cls._STORAGE, cleared, audit=True, audit_metadata={"user": user, "audit_note": audit_note})
            if archive:
                arc_path = f"{cls._STORAGE}.{now.replace(':','-').replace('.','_')}.archive.json"
                save_json(arc_path, cleared, audit=False)

    @classmethod
    def get_full_stream(cls) -> Dict[str, Any]:
        """Raw access to full focus stream object (all metadata)."""
        return load_json(cls._STORAGE, default={}, validator=_validate_focus)

    @classmethod
    def add_focus_item(
        cls,
        item: Union[str, Dict],
        user: Optional[str] = None,
        position: Optional[int] = None,
        tags: Optional[List[str]] = None,
        priority: Optional[int] = None,
        audit_note: str = "add_focus_item"
    ) -> None:
        """
        Add a focus item to the current stream, optionally with tags/priority. Thread safe.
        """
        with cls._LOCK:
            fs = cls.get_full_stream() or {}
            items = list(fs.get("current_focus", []))
            it = item
            if isinstance(item, dict) and tags:
                it = dict(item)
                it.setdefault("tags", list(tags))
                if priority is not None:
                    it["priority"] = priority
            elif isinstance(item, str) and tags:
                it = {"desc": item, "tags": list(tags)}
                if priority is not None:
                    it["priority"] = priority
            if position is None:
                items.append(it)
            else:
                items.insert(position, it)
            cls.set_focus_stream(
                items,
                user=user,
                stream_tags=fs.get('tags', []),
                audit_note=audit_note,
                custom_fields={k: fs.get(k) for k in ("history", "context", "version", "priority")}
            )

    @classmethod
    def remove_focus_item(
        cls,
        item: Union[str, Dict],
        user: Optional[str] = None,
        audit_note: str = "remove_focus_item"
    ) -> None:
        """
        Remove a focus item matching the exact value or dict. Thread safe.
        """
        with cls._LOCK:
            fs = cls.get_full_stream()
            items = [f for f in fs.get("current_focus", []) if f != item]
            cls.set_focus_stream(
                items,
                user=user,
                stream_tags=fs.get('tags', []),
                audit_note=audit_note,
                custom_fields={k: fs.get(k) for k in ("history", "context", "version", "priority")}
            )

    @classmethod
    def audit_trail(cls, limit: Optional[int] = 100) -> List[Dict[str, Any]]:
        """Return a list of recent audit events from audit file, if present."""
        from pathlib import Path
        fp = Path(cls._STORAGE).with_suffix(".json.audit.txt")
        if not fp.exists():
            return []
        with fp.open("r", encoding="utf-8") as f:
            lines = f.readlines()[-limit:]
        result = []
        for l in lines:
            try:
                when, rest = l.split("::", 1)
                parts = rest.strip().split("|", 1)
                note = parts[0].strip()
                extra = parts[1].strip() if len(parts) > 1 else ""
                d = {"when": when.strip(), "note": note, "extra": extra}
                result.append(d)
            except Exception:
                continue
        return result

    @classmethod
    def diff_streams(cls, stream_a: Dict[str, Any], stream_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Diff two stream objects, returning items added/removed/changed.
        """
        import difflib
        a_items, b_items = stream_a.get("current_focus", []), stream_b.get("current_focus", [])
        diff = difflib.unified_diff(
            [str(i) for i in a_items], [str(i) for i in b_items], lineterm="")
        return {"diff": "\n".join(diff)}

    @classmethod
    def subscribe_focus_stream(
        cls, callback, poll_interval: float = 2.0
    ):
        """
        Subscribe to updates in focus stream. Calls callback on changes.
        """
        import hashlib
        import time

        def _watch():
            last_hash = None
            while True:
                with cls._LOCK:
                    fs = cls.get_full_stream()
                    data_bytes = str(fs).encode("utf-8")
                    current_hash = hashlib.md5(data_bytes).hexdigest()
                    if last_hash != current_hash:
                        callback(fs)
                        last_hash = current_hash
                time.sleep(poll_interval)

        t = threading.Thread(target=_watch, daemon=True)
        t.start()
        return t

# Maintain legacy API for backwards compatibility
def set_focus_stream(
    focus_items: List[Union[str, Dict]],
    user: Optional[str] = None,
    stream_tags: Optional[List[str]] = None,
    audit_note: str = "set_focus"
) -> None:
    return FocusStreamController.set_focus_stream(
        focus_items, user=user, stream_tags=stream_tags, audit_note=audit_note
    )

def get_focus_stream() -> Any:
    return FocusStreamController.get_focus_stream()

def clear_focus_stream() -> None:
    return FocusStreamController.clear_focus_stream()

def add_focus_item(item: Union[str, Dict], user: Optional[str] = None, tags: Optional[List[str]] = None):
    return FocusStreamController.add_focus_item(item, user=user, tags=tags)

def remove_focus_item(item: Union[str, Dict], user: Optional[str] = None):
    return FocusStreamController.remove_focus_item(item, user=user)

def focus_audit_trail(limit: Optional[int] = 100):
    return FocusStreamController.audit_trail(limit=limit)
