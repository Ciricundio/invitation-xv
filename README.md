# 🦋 Invitación Digital: Mis XV Años – Maria José 🌹

Bienvenidos al repositorio de la invitación digital interactiva de **Maria José**. Este proyecto es una web app elegante, de estilo floral y altamente responsiva diseñada para gestionar confirmaciones de asistencia (RSVP) de sus invitados utilizando un flujo interactivo y conexión en tiempo real a Supabase.

---

## 🎨 Estética y Diseño

El diseño está concebido bajo una paleta **"Formal Elegante"**:
- **Colores Principales:** Azul Rey (Royal Blue), Oro (Gold), Lavanda y Blanco Profundo.
- **Tipografía Premium:** Uso de `Cormorant Garamond` (textos clásicos), `Great Vibes` (firmas y nombres) y `Jost` (cuerpos limpios).
- **Inmersión Botánica Constante:** Un elaborado entramado arquitectónico compuesto de "Blue Roses" configuradas dinámicamente con CSS `clamp()`, envolviendo las esquinas a nivel `fixed` independientemente de si el explorador es una computadora panorámica o la estrechez de un teléfono celular.
- **Microinteracciones y Magia:** Candados flotantes en pórticos de bienvenida transparentes, animaciones *Smooth Fade-Up*, y confeti orgánico de 30% a 50%.

## ✨ Características Principales

1. **Pórtico de Bienvenida (*Welcome Gate*):** Los invitados deben insertar su nombre antes de cruzar la puerta virtual. El sistema registra su nombre como un "Cookie/Session" en JS para que les asista a lo largo de su experiencia sin volver a requerirlo.
2. **Timeline Vertical (Linetime):** Rediseño sofisticado minimalista de Fecha, Hora y Lugar en listado vertical conectado por líneas doradas luminosas.
3. **Módulo de Vestimenta Dinámico:** Bloque de avisos formales recordando la reserva exclusiva del "Azul Rey".
4. **RSVP Inteligente Unificado:** Formulario final que adapta en tiempo real el flujo de la confirmación:
   - **Camino "A" (Asistencia denegada):** Envío automático y sutil a tu base de datos notificando de forma cordial.
   - **Camino "B" (Invitación Aceptada):** El panel da la bienvenida al invitado y despliega control de *Acompañantes Extras*. Desencadena confetti al completarlo con éxito.
5. **Panel In-House de Control de Invitados:** Plataforma local administrativa (`admin.html`) para leer y tabular al momento los usuarios RSVP conectados directamente de **Supabase**.

---

## 🛠️ Stack Tecnológico

Este proyecto fue desarrollado bajo una arquitectura moderna *Vanilla*, priorizando rendimiento sin dependencias pesadas:
- **Core de Interfaz:** HTML5 Semántico + CSS3 (Variables, Flexbox y Grillas Inteligentes).
- **Base de Datos (BaaS):** Supabase (Vanilla REST API).
- **Lógica e Interacción:** JS Vanilla puro estructurado de forma modular (SOLID concept) en `rsvp.js`, `countdown.js`, `animations.js`.

---

## 🚀 Despliegue Configurado (Render)

La arquitectura soporta subida estática de primer plano a Hostings como Render o Netlify. El archivo `index.html` es auto-contenido junto con los scripts relativos.  
Se conecta de manera independiente a su clúster de Base de Datos para el manejo del conteo.

### Supabase Table Estructura:
`rsvps` table: 
- `id` (int/uuid)
- `name` (text/string)
- `attending` (boolean)
- `companions` (int)
- `created_at` (timestamp)

---
> *«Hay momentos inolvidables que se graban en el corazón para siempre…»*