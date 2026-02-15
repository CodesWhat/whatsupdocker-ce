/**
 * Extends the LogInjection query to recognize `sanitizeLogParam()` as a sanitizer.
 *
 * `sanitizeLogParam` strips control characters and ANSI escapes via
 * `String.replace()` before values are interpolated into log messages.
 */

import javascript
import semmle.javascript.security.dataflow.LogInjectionQuery as LogInjection

/**
 * A call to `sanitizeLogParam(value)` is a barrier for log injection taint flow.
 */
class SanitizeLogParamBarrier extends LogInjection::Sanitizer {
  SanitizeLogParamBarrier() {
    exists(DataFlow::CallNode call |
      call.getCalleeName() = "sanitizeLogParam" and
      this = call
    )
  }
}
