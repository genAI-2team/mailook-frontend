import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", ...process.argv.slice(2)], {
  stdio: ["inherit", "pipe", "pipe"],
  env: { ...process.env, FORCE_COLOR: "1" },
});
for (const stream of [child.stdout, child.stderr]) {
  createInterface({ input: stream }).on("line", (line) => {
    const time = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul", hour12: false });
    console.log(`\u001b[33m${time}\u001b[0m ${line}`);
  });
}
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
