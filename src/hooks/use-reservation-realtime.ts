import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReservationUpdate {
  id: string;
  status: string;
  document_status: string;
  payment_status: string;
}

export const useReservationRealtime = (
  userId: string | null | undefined,
  onUpdate?: (reservation: ReservationUpdate) => void
) => {
  useEffect(() => {
    if (!userId) return;

    // Subscribe to realtime updates for user's reservations
    const channel = supabase
      .channel(`reservations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservations",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const reservation = payload.new as ReservationUpdate;
          onUpdate?.(reservation);

          // Send browser notification if status changed to approved
          if (
            reservation.document_status === "approved" ||
            reservation.status === "confirmed"
          ) {
            sendBrowserNotification(
              "✅ Seu cadastro foi aprovado!",
              "O link de pagamento já está disponível. Clique aqui para continuar.",
              reservation.id
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);
};

export const sendBrowserNotification = (
  title: string,
  body: string,
  tag?: string
) => {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.log("Browser não suporta notificações");
    return;
  }

  // Request permission if not granted
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: tag || "ekoa-notification",
      requireInteraction: true,
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.svg",
          badge: "/favicon.svg",
          tag: tag || "ekoa-notification",
          requireInteraction: true,
        });
      }
    });
  }
};
