// watchdog.worker.js

let failureTimeout;
const FAILURE_TIMEOUT_MS = 3000; // If no heartbeat in 3s, assume freeze.

self.onmessage = (event) => {
  if (event.data === 'HEARTBEAT') {
    // Heartbeat received, reset the failure timer.
    clearTimeout(failureTimeout);
    failureTimeout = setTimeout(() => {
      // Timer fired, main thread is likely frozen.
      self.postMessage('HANDOFF_TO_STANDBY');
    }, FAILURE_TIMEOUT_MS);
  } else if (event.data === 'START') {
    // Initial start message, set the first timer.
     failureTimeout = setTimeout(() => {
      self.postMessage('HANDOFF_TO_STANDBY');
    }, FAILURE_TIMEOUT_MS);
  }
};
