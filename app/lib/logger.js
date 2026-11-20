let sequence = 0;

export function logExecution(message) {
  if (process.env.NODE_ENV === "production") return;

  console.log(`#${++sequence} ${message}`);
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
