self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/admin";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => new URL(client.url).pathname.startsWith("/admin"));
      return existing ? existing.focus() : clients.openWindow(target);
    })
  );
});
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(self.registration.showNotification(data.title || "RXZ Gamer", {
    body: data.body || "Recibiste un pedido nuevo.", icon: "/icon-192.png", badge: "/icon-192.png",
    tag: data.tag || "rxz-new-order", data: { url: data.url || "/admin" }
  }));
});
