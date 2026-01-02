import { app as i, BrowserWindow as f, ipcMain as g } from "electron";
import c from "path";
import { fileURLToPath as _ } from "url";
const k = _(import.meta.url), b = c.dirname(k);
function P() {
  return i.isPackaged ? c.join(b, "..", "dist") : c.join(process.cwd(), "dist");
}
function m() {
  return c.join(b, "preload.cjs");
}
function C() {
  if (!i.isPackaged)
    return c.join(process.cwd(), "build", "icons", "icon.png");
}
let n = null, e = null;
function u() {
  const t = m(), d = P(), s = c.join(d, "index.html"), l = C();
  if (console.log("🎯 蕾姆：主窗口配置", {
    preloadPath: t,
    distPath: d,
    indexPath: s,
    iconPath: l,
    platform: process.platform
  }), n = new f({
    width: 1200,
    // 📏 蕾姆：加大宽度，提供更舒适的工作空间
    height: 800,
    // 📏 蕾姆：增加高度，展示更多内容
    backgroundColor: "#FFFFFF",
    icon: l,
    // 🎯 蕾姆：设置应用图标
    show: !1,
    // 等待加载完成后再显示，避免白屏
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      sandbox: !1,
      // 🎯 蕾姆：暂时关闭沙箱，确保 preload 正常加载
      preload: t,
      // 🎯 蕾姆：允许加载本地文件
      webSecurity: !1
      // 仅用于本地开发，生产环境可考虑开启
    }
  }), i.isPackaged || n.webContents.openDevTools(), n.webContents.on(
    "did-fail-load",
    (a, o, r, w) => {
      console.error("❌ 蕾姆：页面加载失败", {
        errorCode: o,
        errorDescription: r,
        validatedURL: w
      });
    }
  ), n.webContents.on("did-finish-load", () => {
    console.log("✅ 蕾姆：主窗口加载完成"), n.webContents.send("window-type", "main");
  }), i.isPackaged)
    console.log("📁 蕾姆：加载打包文件", s), n.loadFile(s);
  else {
    const a = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    console.log("🌐 蕾姆：加载开发服务器", a), n.loadURL(a);
  }
  n.once("ready-to-show", () => {
    console.log("🎉 蕾姆：主窗口准备显示"), n.show();
  }), n.on("closed", () => {
    n = null;
  });
}
function v() {
  if (e && !e.isDestroyed()) {
    e.focus();
    return;
  }
  const t = m(), d = P(), s = c.join(d, "index.html"), l = C();
  if (e = new f({
    width: 900,
    // 📏 蕾姆：扩展设置面板宽度
    height: 700,
    // 📏 蕾姆：增加设置面板高度
    show: !1,
    // 等待加载完成后再显示，避免白屏
    resizable: !0,
    title: "Onir 设置",
    icon: l,
    // 🎯 蕾姆：设置应用图标
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      sandbox: !1,
      // 🎯 蕾姆：暂时关闭沙箱，确保 preload 正常加载
      preload: t,
      webSecurity: !1
    }
  }), i.isPackaged, e.webContents.on(
    "did-fail-load",
    (a, o, r, w) => {
      console.error("❌ 蕾姆：设置窗口加载失败", {
        errorCode: o,
        errorDescription: r,
        validatedURL: w
      });
    }
  ), i.isPackaged)
    console.log("📋 蕾姆：生产环境设置窗口加载", s), e.loadFile(s), e.webContents.once("did-finish-load", () => {
      console.log("📋 蕾姆：生产环境设置窗口加载完成"), e.webContents.executeJavaScript(
        'window.__WINDOW_TYPE__ = "settings"'
      ), e.webContents.send("window-type", "settings");
    });
  else {
    const o = `${process.env.VITE_DEV_SERVER_URL || "http://localhost:5173"}/general-settings`;
    console.log("🎯 蕾姆：设置窗口 URL =", o), e.loadURL(o), e.webContents.on("did-finish-load", () => {
      console.log(
        "📋 蕾姆：设置窗口加载完成，当前 URL =",
        e.webContents.getURL()
      ), e.webContents.send("window-type", "settings");
    });
  }
  e.once("ready-to-show", () => {
    console.log("🎉 蕾姆：设置窗口准备显示"), e.show();
  }), e.on("closed", () => {
    e = null;
  });
}
i.whenReady().then(() => {
  u(), i.on("activate", () => {
    f.getAllWindows().length === 0 && u();
  }), g.on("open-settings-window", () => {
    v();
  }), g.on("close-settings-window", () => {
    e && !e.isDestroyed() && e.close();
  });
  const t = /* @__PURE__ */ new Map();
  g.handle(
    "deepseek-chat",
    async (d, { messages: s, options: l, apiKey: a }) => {
      const o = Date.now();
      console.log("🤖 蕾姆：收到 DeepSeek 聊天请求，requestId =", o);
      try {
        const { DeepSeekClient: r } = await import("./index-b84rv4TZ.js"), w = new r(a), p = new AbortController();
        return t.set(o, p), await w.chat(
          s,
          {
            onChunk: (h) => {
              n.isDestroyed() || n.webContents.send("deepseek-chunk", {
                requestId: o,
                chunk: h
              });
            },
            onComplete: () => {
              console.log("✅ 蕾姆：请求完成，requestId =", o), n.isDestroyed() || n.webContents.send("deepseek-complete", { requestId: o }), t.delete(o);
            },
            onError: (h) => {
              console.error("❌ 蕾姆：请求失败，requestId =", o, h), n.isDestroyed() || n.webContents.send("deepseek-error", {
                requestId: o,
                error: h.message
              }), t.delete(o);
            }
          },
          {
            signal: p.signal,
            ...l
          }
        ), { requestId: o };
      } catch (r) {
        throw console.error("❌ 蕾姆：处理请求失败", r), t.delete(o), r;
      }
    }
  ), g.on("abort-deepseek-chat", (d, s) => {
    console.log("🛑 蕾姆：收到取消请求，requestId =", s);
    const l = t.get(s);
    l && (l.abort(), t.delete(s));
  });
});
i.on("window-all-closed", () => {
  process.platform !== "darwin" && i.quit();
});
