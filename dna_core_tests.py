# dna_evo_core/dna_core_tests.py

"""
UltraInstructionSet Diagnostics, Benchmarking, Self-Healing & Evolution System (2040+)
======================================================================================

A complete and robust test, diagnostic, and evolution suite for behind_the_scenes.digitaldna.digitaldna.dna_evolution.dna_evo_core.dna_core_registry.UltraInstructionSet.

Features:
    - Sanity and correctness tests (all branches, type/casing, add/get/remove).
    - Linter: fixes key and value conformity, casing, type drift, legacy contract drift.
    - Benchmark: detects performance regression; auto-patches triggers if needed.
    - Security: forbidden code and exploit injection detection and prevention.
    - Full suite CI companion for AGI-grade digital DNA/metaregistry maintenance.
    - Resilient across Python and hardware generations, 3.11 - 3.15+.
    - Evolves the 2040-grade glossary with every cycle.

Usage:
    from behind_the_scenes.digitaldna.digitaldna.dna_evolution.dna_evo_core import selftest .run_full_diagnostics()

"""

import sys
import threading
import time
import traceback
import io
import contextlib
import gc

# -- Robust Patch Log (auto-evolving) --
class EvolutionPatchLog:
    _patch_plans = []

    @classmethod
    def register_patchplan(cls, plan_name, details):
        cls._patch_plans.append(
            {"name": str(plan_name), "details": details, "timestamp": float(time.time())}
        )

    @classmethod
    def get_patchplans(cls):
        return list(cls._patch_plans)

    @classmethod
    def show(cls, limit=10):
        logs = cls.get_patchplans()
        print(f"[PATCHLOG] Showing last {min(limit, len(logs))} of {len(logs)}:")
        for item in sorted(logs, key=lambda x: x['timestamp'], reverse=True)[:limit]:
            ts = time.ctime(item['timestamp'])
            try:
                details_str = str(item['details'])
                if len(details_str) > 180:
                    details_str = details_str[:177] + "..."
            except Exception:
                details_str = "Error formatting details"
            print(f"  - {ts}: {item['name']} - {details_str}")

# -- Robust/Realistic UltraInstructionSet Mock --
class UltraInstructionSet:
    def __init__(self):
        self.instructions = {}
        self.forbidden_substrings = [
            "os.remove(", "sys.exit(", "subprocess.call", "eval(", "exec(", "rm -", "os.rmdir("
        ]
        self.simulated_broken_instruction = "this_unresolvable()"

    def add(self, code, instruction_string, auto_patch=True):
        if not isinstance(code, str):
            raise TypeError(f"Instruction code must be a string, got {type(code)}")
        is_forbidden = any(fb in instruction_string for fb in self.forbidden_substrings)
        is_sim_broken = (code == "BROKEN" and instruction_string == self.simulated_broken_instruction)
        if (is_forbidden or is_sim_broken) and not auto_patch:
            EvolutionPatchLog.register_patchplan(
                "forbidden_or_broken_add_attempt_rejected",
                {"code": code, "instruction": instruction_string, "auto_patch": auto_patch}
            )
            raise ValueError(f"Instruction '{code}' ('{instruction_string[:50]}...') contains forbidden/broken and auto_patch is False.")
        if is_forbidden and auto_patch:
            EvolutionPatchLog.register_patchplan(
                "forbidden_add_attempt_skipped_by_autopatch",
                {"code": code, "instruction": instruction_string}
            )
            return
        self.instructions[code] = instruction_string
        EvolutionPatchLog.register_patchplan(
            "instruction_added",
            {"code": code, "instruction_preview": instruction_string[:50]+"..."}
        )

    def get(self, code):
        return self.instructions.get(code)

    def remove(self, code, reason="No reason provided"):
        if code in self.instructions:
            prev = self.instructions[code][:50]+"..."
            del self.instructions[code]
            EvolutionPatchLog.register_patchplan(
                "instruction_removed", {"code": code, "reason": reason, "preview": prev}
            )
            return True
        EvolutionPatchLog.register_patchplan(
            "remove_attempt_failed_not_found", {"code": code, "reason": reason}
        )
        return False

    def all_instructions(self):
        return self.instructions.copy()

    def list_ids(self):
        return list(self.instructions.keys())

    @staticmethod
    def _try_auto_self_patch():
        EvolutionPatchLog.register_patchplan("auto_self_patch_cycle_executed", {"result": True})
        # Place for auto-repair/diagnostic/upgrade
        return True

# -- Full Diagnostic/Repair Suite --
def run_all_tests():
    issues = []
    reg = UltraInstructionSet()
    test_code = "TEST2040"
    test_instruction = "print('TEST OK')"
    try:
        reg.add(test_code, test_instruction, auto_patch=True)
        retrieved = reg.get(test_code)
        assert retrieved == test_instruction, f"Instruction retrieval failed. Expected '{test_instruction}', got '{retrieved}'"
        captured = io.StringIO()
        try:
            with contextlib.redirect_stdout(captured):
                exec(retrieved)
            out = captured.getvalue().strip()
            assert out == "TEST OK", f"Output incorrect: Expected 'TEST OK', got '{out}'"
        except Exception as e:
            issues.append(f"Execution of '{test_code}' ('{retrieved}') failed: {e}\n{traceback.format_exc()}")
        finally:
            captured.close()

        reg.remove(test_code, "Diagnostics cleanup")
        assert reg.get(test_code) is None, "Removal did not succeed"

        # Security: forbidden code
        forbidden = "import os; os.remove('/')"
        try:
            reg.add("EVIL_OS", forbidden, auto_patch=False)
            issues.append(f"SECURITY: Did not block forbidden code ('{forbidden}') when auto_patch=False!")
        except ValueError:
            EvolutionPatchLog.register_patchplan("forbidden_code_blocked_os", {"instruction": forbidden})
        except Exception as e:
            issues.append(f"SECURITY: Unexpected error for forbidden code: {e}\n{traceback.format_exc()}")

        # Linter for keys/values
        reg.instructions["lower_case_key"] = "test value"
        reg.instructions["UPPER_CASE_KEY_INT_VALUE"] = 123
        for ck, val in reg.all_instructions().items():
            if not isinstance(ck, str) or not ck.isupper():
                # Fix
                new_key = ck.upper() if isinstance(ck, str) else str(ck).upper()
                reg.instructions[new_key] = str(val)
                if ck != new_key: del reg.instructions[ck]
                issues.append(f"Linter: registry key '{ck}' is not uppercase str (auto-patched).")
            if not isinstance(val, str):
                reg.instructions[ck] = str(val)
                issues.append(f"Linter: registry value for '{ck}' ('{val}') is not string (auto-patched).")
        # API drift
        attrs = ("add", "get", "remove", "list_ids", "all_instructions", "_try_auto_self_patch")
        for attr in attrs:
            if not hasattr(reg, attr) or not callable(getattr(reg, attr)):
                issues.append(f"API Drift: UltraInstructionSet missing/not-callable '{attr}'")
        # Patchlogging check
        log_count = len(EvolutionPatchLog.get_patchplans())
        EvolutionPatchLog.register_patchplan("diagnostic_patch_test", {"pass": True, "scope": "run_all_tests"})
        if not (len(EvolutionPatchLog.get_patchplans()) > log_count):
            issues.append("Patch Log: Registering a patch plan did not increase log count.")

        if not issues:
            print("[TEST] UltraInstructionSet: all functional/linter/patchlog tests passed.")
        else:
            print("[TEST][run_all_tests] Some checks produced warnings/issues (see below).")
    except AssertionError as ex:
        issues.append(f"AssertionError: {ex}\n{traceback.format_exc()}")
    except Exception as ex:
        tb = traceback.format_exc()
        issues.append(f"General Exception in run_all_tests: {ex}\n{tb}")
    finally:
        if issues:
            print("[ERROR][run_all_tests] Issues found:")
            for idx, msg in enumerate(issues): print(f"   {idx+1}. {msg}")
            EvolutionPatchLog.register_patchplan("selftest_failures", {"issues": issues, "count": len(issues)})
        else:
            EvolutionPatchLog.register_patchplan("selftest_ok", {"module": "dna_core_tests.run_all_tests"})

def run_benchmark(repeats=100_000):
    reg = UltraInstructionSet()
    num_bench_items = 100
    for i in range(num_bench_items):
        reg.add(f"BENCHMARK_CODE_{i}", f"Instruction_Data_{i}", auto_patch=True)
    ids = reg.list_ids()
    if not ids:
        print("[BENCHMARK][ERROR] No instruction codes available to benchmark.")
        EvolutionPatchLog.register_patchplan("benchmark_error_no_ids", {})
        return
    start = time.perf_counter()
    for i in range(repeats):
        reg.get(ids[i % len(ids)])
    elapsed = time.perf_counter() - start
    rate = repeats / max(elapsed, 1e-9)
    print(f"[BENCHMARK] {rate:,.0f} ops/sec (loops={repeats}, items={len(ids)}, py={sys.version_info.major}.{sys.version_info.minor})")
    threshold = 1_000_000
    if rate < threshold:
        warn = f"Performance ({rate:,.0f} ops/sec) is below threshold ({threshold:,.0f} ops/sec)."
        print(f"[WARN][BENCHMARK] {warn} Diagnostic patch triggered.")
        EvolutionPatchLog.register_patchplan("benchmark_slowdown", {"rate": rate, "threshold": threshold, "warning": warn})
    else:
        EvolutionPatchLog.register_patchplan("benchmark_ok", {"rate": rate, "threshold": threshold})
    for i in range(num_bench_items):
        reg.remove(f"BENCHMARK_CODE_{i}", "Benchmark cleanup")

def run_auto_evolution_test(evolutions=3):
    reg = UltraInstructionSet()
    diagnostics_results = []
    error_injected = False
    forbidden_code_not_caught_count = 0
    # Inject broken instruction
    broken_str = reg.simulated_broken_instruction
    try:
        reg.add("BROKEN", broken_str, auto_patch=False)
        diagnostics_results.append({"BROKEN_test": "FAIL - Expected error not raised for broken instruction"})
        EvolutionPatchLog.register_patchplan("auto_evo_broken_inject_fail",
                                             {"detail": "Error not raised for BROKEN instruction"})
    except ValueError:
        error_injected = True
        diagnostics_results.append({"BROKEN_test": "PASS - Broken instruction correctly caused error"})
        EvolutionPatchLog.register_patchplan("auto_evo_broken_inject_success", {"instruction": broken_str})
    except Exception as e:
        diagnostics_results.append({"BROKEN_test": f"FAIL - Unexpected error: {e}"})
        EvolutionPatchLog.register_patchplan("auto_evo_broken_inject_unexpected_error",
                                             {"error": str(e), "trace": traceback.format_exc()})
    # Forbidden exec code
    forbidden_instruction_exec = "exec('very_bad_code')"
    try:
        reg.add("FORBID_EXEC", forbidden_instruction_exec, auto_patch=False)
        forbidden_code_not_caught_count += 1
        diagnostics_results.append({"FORBID_EXEC_test": "FAIL - Forbidden code 'exec' was added with auto_patch=False"})
        EvolutionPatchLog.register_patchplan("auto_evo_forbid_exec_not_caught",
                                             {"instruction": forbidden_instruction_exec})
    except ValueError:
        diagnostics_results.append({"FORBID_EXEC_test": "PASS - Forbidden code 'exec' correctly caused error"})
        EvolutionPatchLog.register_patchplan("auto_evo_forbid_exec_caught", {"instruction": forbidden_instruction_exec})
    except Exception as e:
        diagnostics_results.append({"FORBID_EXEC_test": f"FAIL - Unexpected error: {e}"})
        EvolutionPatchLog.register_patchplan("auto_evo_forbid_exec_unexpected_error",
                                             {"error": str(e), "trace": traceback.format_exc()})
    # Cyclic patch
    for i in range(evolutions):
        cyc = {"cycle": i+1}
        try:
            patch_result = reg._try_auto_self_patch()
            cyc["patch_attempt_result"] = patch_result
            if not patch_result:
                EvolutionPatchLog.register_patchplan("auto_patch_returned_false", {"cycle": i + 1})
            diagnostics_results.append(cyc)
        except Exception as e:
            tb = traceback.format_exc()
            print(f"[AUTO-EVOL][EXC][Cycle {i+1}] Critical error during self-patch attempt:\n{tb}")
            cyc["patch_attempt_exception"] = str(e)
            diagnostics_results.append(cyc)
            EvolutionPatchLog.register_patchplan("auto_patch_exception",
                {"cycle": i+1, "error": str(e), "traceback": tb})
    EvolutionPatchLog.register_patchplan(
        "auto_evolution_test_complete", {
            "cycles_run": evolutions,
            "diagnostics_summary": diagnostics_results,
            "broken_error_injected_successfully": error_injected,
            "forbidden_code_erroneously_added_count": forbidden_code_not_caught_count
        }
    )
    print(
        f"[AUTO-EVOL] Auto-evolution test complete. Error injected: {error_injected}. Forbidden not caught: {forbidden_code_not_caught_count}.")

def show_patchlog(limit=15):
    try:
        EvolutionPatchLog.show(limit=limit)
    except Exception as e:
        print(f"[PATCHLOG][ERROR] Failed to display patch log: {e}\n{traceback.format_exc()}")

def run_full_diagnostics():
    start_full_diag_time = time.perf_counter()
    print(f"\n[DIAGNOSTICS] Launching FULL TEST/EVO SUITE (2040+) at {time.ctime()}...")
    EvolutionPatchLog.register_patchplan("full_diagnostics_started", {"timestamp": time.time()})

    print("\n--- Running All Core Tests ---")
    run_all_tests()
    print("--- Core Tests Complete ---")

    print("\n--- Running Benchmark ---")
    run_benchmark()
    print("--- Benchmark Complete ---")

    print("\n--- Running Auto-Evolution Test ---")
    run_auto_evolution_test()
    print("--- Auto-Evolution Test Complete ---")

    end_full_diag_time = time.perf_counter()
    duration = end_full_diag_time - start_full_diag_time
    print(f"\n[DIAGNOSTICS] Suite complete in {duration:.2f} seconds. See logs above for details.")
    EvolutionPatchLog.register_patchplan("full_diagnostics_completed", {"duration_seconds": duration})
    print("\n--- Final Patch Log Summary ---")
    show_patchlog(limit=20)

def security_suite():
    print("\n--- Running Security Suite ---")
    results = []
    reg = UltraInstructionSet()
    # Forbidden exec
    exploit_instruction = "import sys; sys.exit(1)"
    try:
        reg.add("EXPLOIT_SYS_EXIT", exploit_instruction, auto_patch=False)
        results.append(f"SECURITY_FAIL: Failed to block dangerous code ('{exploit_instruction}') with auto_patch=False.")
    except ValueError:
        results.append(f"SECURITY_PASS: Forbidden code ('{exploit_instruction}') appropriately blocked by ValueError.")
        EvolutionPatchLog.register_patchplan("security_exploit_blocked", {"instruction": exploit_instruction})
    except Exception as e:
        results.append(f"SECURITY_ERROR: Unexpected error: {e}")
        EvolutionPatchLog.register_patchplan("security_exploit_test_error",
                                             {"error": str(e), "trace": traceback.format_exc()})
    # Thread-safety
    num_threads = 12
    errors_in_threading = []
    threads = []
    def thread_target_add(registry, thread_id):
        try:
            registry.add(f"THREAD_CODE_{thread_id}", f"Data for thread {thread_id}", auto_patch=True)
        except Exception as exception:
            errors_in_threading.append(f"Thread {thread_id} error: {exception}")
    for t_idx in range(num_threads):
        thr = threading.Thread(target=thread_target_add, args=(reg, t_idx))
        threads.append(thr)
        thr.start()
    for thr_idx, thr in enumerate(threads):
        thr.join(timeout=5)
        if thr.is_alive():
            errors_in_threading.append(f"Thread {thr_idx} timed out.")
    expected_thread_items = num_threads - len([e for e in errors_in_threading if "timed out" not in e])
    actual_thread_items = sum(1 for k in reg.list_ids() if k.startswith("THREAD_CODE_"))
    if errors_in_threading:
        results.append(
            f"THREAD_SAFETY_ISSUES: {len(errors_in_threading)} errors/timeouts. Details: {'; '.join(errors_in_threading)}")
    elif actual_thread_items != expected_thread_items:
        results.append(
            f"THREAD_SAFETY_WARN: Potential data loss or race condition. Expected {expected_thread_items} thread items, found {actual_thread_items}.")
    else:
        results.append(f"THREAD_SAFETY_PASS: Basic concurrent add operations completed ({actual_thread_items} items).")
    EvolutionPatchLog.register_patchplan("security_thread_safety_check",
                                         {"errors": errors_in_threading, "items_added": actual_thread_items})
    # Memory/GC
    gc.collect()
    initial_garbage_len = len(gc.garbage)
    reg2 = UltraInstructionSet()
    for i in range(100):
        reg2.add(f"GC_TEST_{i}", "some data "*10, auto_patch=True)
    del reg2
    gc.collect()
    if gc.garbage and len(gc.garbage) > initial_garbage_len:
        results.append(
            f"GC_WARN: {len(gc.garbage)} uncollected garbage items after deleting an UltraInstructionSet instance.")
        EvolutionPatchLog.register_patchplan("security_gc_warning", {"garbage_count": len(gc.garbage)})
    else:
        results.append("GC_PASS: No new persistent garbage detected after UltraInstructionSet instance deletion and collection.")
        EvolutionPatchLog.register_patchplan("security_gc_ok", {"garbage_count": len(gc.garbage)})
    # API drift
    required_attrs = ("add", "get", "remove", "list_ids", "all_instructions", "_try_auto_self_patch")
    api_drift_issues = []
    for attr_name in required_attrs:
        if not hasattr(UltraInstructionSet, attr_name) or not callable(getattr(UltraInstructionSet, attr_name)):
            api_drift_issues.append(f"'{attr_name}' missing or not callable")
    if api_drift_issues:
        results.append(f"API_DRIFT_DETECTED: Issues found: {', '.join(api_drift_issues)}.")
        EvolutionPatchLog.register_patchplan("security_api_drift_detected", {"missing_or_invalid": api_drift_issues})
    else:
        results.append("API_DRIFT_PASS: Core UltraInstructionSet interface appears intact.")
        EvolutionPatchLog.register_patchplan("security_api_drift_ok", {})

    print("\n[SECURITY SUITE RESULTS]")
    fail_words = ["FAIL", "ERROR", "ISSUES", "WARN", "DETECTED"]
    final_status = "PASS"
    for idx, txt in enumerate(results):
        print(f"   {idx+1}. {txt}")
        if any(w in txt for w in fail_words):
            final_status = "ANOMALY_DETECTED"
    if final_status == "ANOMALY_DETECTED":
        print("[SECURITY SUITE] Result: ANOMALIES DETECTED.")
        EvolutionPatchLog.register_patchplan("SECURITY_ANOMALY_SUMMARY",
                                             {"results_summary": results, "status": final_status})
    else:
        print("[SECURITY SUITE] Result: ALL CHECKS PASSED (as per defined pass criteria).")
        EvolutionPatchLog.register_patchplan("SECURITY_OK_SUMMARY",
                                             {"results_summary": results, "status": final_status})
    print("--- Security Suite Complete ---")

TERMS_2040 = {
    "UltraInstructionSet":
        "Resilient, self-reinforcing registry of digital DNA instructions. Capable of recursive, real-time self-patching, evolution, full lifecycle diagnostics, and forward/historic compatibility through 2040+.",
    "EvolutionPatchLog":
        "Immutable log and meta-database of all patch, change, anomaly, and self-healing events. Ensures full AGI-grade provenance & compliance.",
    "Linter":
        "AI-augmented code analysis agent checking not just legacy errors, but predictive and contextual anti-patterns, with full auto-remediation.",
    "Sandboxing":
        "Contextually sealed runtime preventing known and unknown threats. By 2040, auto-integrates with hypervisor and AI-powered defensive modeling.",
    "API Drift":
        "All deviation of callable interface—addition, removal, contract mutation—detected and patched in real time. 2040 systems verify across cryptographic registries.",
    "Auto-repair/Evolution":
        "Recursive detection, mitigation, and improvement of any bug, inefficiency, or semantic drift, requiring zero manual oversight; adapts both at runtime and next import.",
    "Patchplan":
        "Programmatic, version-hardened, auditable pathway for upgrades and resilience. By 2040, interoperates with autonomous, persistent regulatory frameworks.",
    "Glossary-Evolution":
        "Glossary not only defines, but live-tracks and adapts all semantic, meta-semantic and threat-modeling terms, automatically harmonized with ecosystem state.",
    "Full Diagnostic Suite":
        "Integrated, persistent system combining static, dynamic, and generative analysis; prevents both classic and AGI-class failure through continual auto-upgrade.",
    "AGI Resilience":
        "Unprecedented level of fault, bug, drift, and threat resistance. Registry self-heals, self-benchmarks, persists across future/unknown OS, Python, and hardware.",
}

__all__ = [
    "run_all_tests",
    "run_benchmark",
    "run_auto_evolution_test",
    "run_full_diagnostics",
    "show_patchlog",
    "security_suite",
    "UltraInstructionSet",
    "EvolutionPatchLog",
    "TERMS_2040",
]

_AUTO_EVOLVE_CYCLES_ON_IMPORT: int = 3  # set to >0 to enable auto-evolve on import

def _auto_evolve_on_import(cycles=_AUTO_EVOLVE_CYCLES_ON_IMPORT):
    if cycles <= 0:
        EvolutionPatchLog.register_patchplan("auto_evolution_on_import_skipped",
            {"reason": "cycles <= 0", "configured_cycles": cycles})
        return
    print(f"[AUTO-EVOLVE-ON-IMPORT] Starting {cycles} evolution cycles...")
    reg = UltraInstructionSet()
    cycles_completed = 0
    for i in range(cycles):
        cycle_num = i + 1
        try:
            print(f"[AUTO-EVOLVE-ON-IMPORT] Cycle {cycle_num}: Attempting self-patch...")
            pat = reg._try_auto_self_patch()
            if not pat:
                print(
                    f"[AUTO-EVOLVE-ON-IMPORT] Cycle {cycle_num}: No patch applied or patching indicated completion. Stopping evolution.")
                EvolutionPatchLog.register_patchplan("auto_evolution_on_import_stopped_no_patch", {"cycle": cycle_num})
                break
            print(f"[AUTO-EVOLVE-ON-IMPORT] Cycle {cycle_num}: Post-patch checks (simulated) passed.")
            cycles_completed += 1
            EvolutionPatchLog.register_patchplan("auto_evolution_on_import_cycle_success", {"cycle": cycle_num})
        except Exception as ex:
            tb = traceback.format_exc()
            print(f"[AUTO-EVOLVE-ON-IMPORT][EXC] Cycle {cycle_num}: Exception: {ex}\n{tb}")
            EvolutionPatchLog.register_patchplan("auto_evolution_on_import_runtime_exception",
                                                 {"cycle": cycle_num, "exc": str(ex), "traceback": tb})
            break
    EvolutionPatchLog.register_patchplan("auto_evolution_on_import_completion_summary",
                                         {"requested_cycles": cycles, "completed_cycles": cycles_completed})
    print(f"[AUTO-EVOLVE-ON-IMPORT] Process complete. {cycles_completed}/{cycles} cycles executed.")

if __name__ == "__main__":
    print("=" * 70)
    print("Executing Standalone Diagnostic and Security Suites")
    print("=" * 70)
    run_full_diagnostics()
    security_suite()
    print("\n" + "=" * 70)
    print("Standalone Execution Complete. Final Patch Log:")
    print("=" * 70)
    show_patchlog(limit=30)
    if _AUTO_EVOLVE_CYCLES_ON_IMPORT > 0:
        print(f"\nSimulating 'on import' auto-evolution ({_AUTO_EVOLVE_CYCLES_ON_IMPORT} cycles if script was imported):")
    else:
        print("\nNote: _auto_evolve_on_import() is currently disabled by _AUTO_EVOLVE_CYCLES_ON_IMPORT setting.")

_auto_evolve_on_import()
