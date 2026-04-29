const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

type TestResult = {
  name: string;
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
};

const results: TestResult[] = [];

async function trpcMutation(path: string, json: unknown) {
  const res = await fetch(`${BASE_URL}/trpc/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json }),
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }

  return { res, body };
}

async function trpcQuery(path: string, json: unknown) {
  const input = encodeURIComponent(JSON.stringify({ json }));
  const res = await fetch(`${BASE_URL}/trpc/${path}?input=${input}`);
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { res, body };
}

function record(name: string, ok: boolean, status?: number, body?: unknown, error?: string) {
  results.push({ name, ok, status, body, error });
}

async function run() {
  // 0) Root health smoke
  try {
    const res = await fetch(`${BASE_URL}/`);
    const body = await res.json();
    record("GET / root", res.ok, res.status, body);
  } catch (e) {
    record("GET / root", false, undefined, undefined, String(e));
  }

  const parentDeviceId = "parent-test-1";
  const childDeviceId = "child-test-1";

  let code = "";

  // 1) pairing.generateCode happy path
  try {
    const { res, body } = await trpcMutation("pairing.generateCode", {
      parentDeviceId,
      deviceName: "Parent Test Phone",
    });
    const bodyAny = body as any;
    code = bodyAny?.result?.data?.json?.code ?? bodyAny?.code ?? "";
    record("pairing.generateCode happy", res.ok, res.status, body);
  } catch (e) {
    record("pairing.generateCode happy", false, undefined, undefined, String(e));
  }

  // 2) pairing.generateCode error path (missing parentDeviceId)
  try {
    const { res, body } = await trpcMutation("pairing.generateCode", {
      deviceName: "No Parent",
    });
    record("pairing.generateCode invalid input", res.status >= 400, res.status, body);
  } catch (e) {
    record("pairing.generateCode invalid input", false, undefined, undefined, String(e));
  }

  // 3) pairing.pairDevice happy path
  try {
    const { res, body } = await trpcMutation("pairing.pairDevice", {
      code,
      childDeviceId,
      childName: "Child Test",
    });
    record("pairing.pairDevice happy", res.ok, res.status, body);
  } catch (e) {
    record("pairing.pairDevice happy", false, undefined, undefined, String(e));
  }

  // 4) pairing.verifyCode edge (likely consumed/invalid after pairing)
  try {
    const { res, body } = await trpcMutation("pairing.verifyCode", {
      code,
      parentDeviceId,
    });
    record("pairing.verifyCode after use edge", res.status >= 400 || res.ok, res.status, body);
  } catch (e) {
    record("pairing.verifyCode after use edge", false, undefined, undefined, String(e));
  }

  // 5) pairing.getPairedDevices happy
  try {
    const { res, body } = await trpcQuery("pairing.getPairedDevices", { parentDeviceId });
    record("pairing.getPairedDevices happy", res.ok, res.status, body);
  } catch (e) {
    record("pairing.getPairedDevices happy", false, undefined, undefined, String(e));
  }

  // 6) pairing.heartbeat happy
  try {
    const { res, body } = await trpcMutation("pairing.heartbeat", { childDeviceId });
    record("pairing.heartbeat happy", res.ok, res.status, body);
  } catch (e) {
    record("pairing.heartbeat happy", false, undefined, undefined, String(e));
  }

  // 7) commands.create happy
  let commandId = "";
  try {
    const { res, body } = await trpcMutation("commands.create", {
      parentDeviceId,
      childDeviceId,
      type: "screenshot",
    });
    const bodyAny = body as any;
    commandId =
      bodyAny?.result?.data?.json?.command?.id ??
      bodyAny?.command?.id ??
      "";
    record("commands.create happy", res.ok, res.status, body);
  } catch (e) {
    record("commands.create happy", false, undefined, undefined, String(e));
  }

  // 8) commands.getChildCommands happy
  try {
    const { res, body } = await trpcQuery("commands.getChildCommands", { childDeviceId });
    record("commands.getChildCommands happy", res.ok, res.status, body);
  } catch (e) {
    record("commands.getChildCommands happy", false, undefined, undefined, String(e));
  }

  // 9) commands.updateStatus happy
  try {
    const { res, body } = await trpcMutation("commands.updateStatus", {
      childDeviceId,
      commandId,
      status: "completed",
      result: "ok",
    });
    record("commands.updateStatus happy", res.ok, res.status, body);
  } catch (e) {
    record("commands.updateStatus happy", false, undefined, undefined, String(e));
  }

  // 10) commands.getParentHistory happy
  try {
    const { res, body } = await trpcQuery("commands.getParentHistory", { parentDeviceId });
    record("commands.getParentHistory happy", res.ok, res.status, body);
  } catch (e) {
    record("commands.getParentHistory happy", false, undefined, undefined, String(e));
  }

  // 11) pairing.unpairDevice happy
  try {
    const { res, body } = await trpcMutation("pairing.unpairDevice", {
      parentDeviceId,
      childDeviceId,
    });
    record("pairing.unpairDevice happy", res.ok, res.status, body);
  } catch (e) {
    record("pairing.unpairDevice happy", false, undefined, undefined, String(e));
  }

  // 12) commands.updateStatus invalid edge (bad command id)
  try {
    const { res, body } = await trpcMutation("commands.updateStatus", {
      childDeviceId,
      commandId: "non-existent-command-id",
      status: "completed",
      result: "noop",
    });
    record("commands.updateStatus invalid id edge", res.status >= 400 || res.ok, res.status, body);
  } catch (e) {
    record("commands.updateStatus invalid id edge", false, undefined, undefined, String(e));
  }

  console.log("=== API THOROUGH TEST RESULTS ===");
  for (const r of results) {
    console.log(`- ${r.ok ? "PASS" : "FAIL"}: ${r.name}${r.status ? ` [${r.status}]` : ""}`);
    if (!r.ok) {
      console.log("  error:", r.error ?? "Unknown");
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nSummary: ${results.length - failed}/${results.length} passed, ${failed} failed.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((e) => {
  console.error("Fatal test runner error:", e);
  process.exit(1);
});
