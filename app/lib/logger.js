let sequence = 0;

export function logExecution(message) {
  if (process.env.NODE_ENV === "production") return;

  const now = new Date();
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0")).join("-");
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((part) => String(part).padStart(2, "0")).join(":");
  const runtime = typeof window === "undefined" ? "SERVER" : "BROWSER";
  console.log(`${date} ${time}.${String(now.getMilliseconds()).padStart(3, "0")} [${runtime} #${++sequence}] ${message}`);
}

/** 입력값·키 입력·DOM 내용을 제외하고 이벤트 종류와 실행 함수만 기록한다. */
export function logUiEvent(event, functionName) {
  logExecution(`EVENT ${event?.type || "call"} → ${functionName}`);
}

export function trace(name, callback) {
  logExecution(`ENTER ${name}`);
  try {
    const result = callback();
    logExecution(`EXIT ${name}`);
    return result;
  } catch (error) {
    logExecution(`ERROR ${name}`);
    throw error;
  }
}

export async function traceAsync(name, callback) {
  logExecution(`ENTER ${name}`);
  try {
    const result = await callback();
    logExecution(`EXIT ${name}`);
    return result;
  } catch (error) {
    logExecution(`ERROR ${name}`);
    throw error;
  }
}
