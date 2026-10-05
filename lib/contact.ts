// WhatsApp de ventas (formato internacional, sin "+" ni espacios).
export const WHATSAPP_NUMBER = "523325382022";

export const whatsappUrl = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
