const recuperarForm = document.getElementById('recuperarForm');
const errorMensaje = document.getElementById('errorMensaje');

recuperarForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('correo').value.trim();

    // Validación básica del correo
    if (!email) {
        errorMensaje.textContent = 'Por favor, ingresa tu correo electrónico.';
        errorMensaje.style.color = '#ff4d4f';
        return;
    }

    try {
        errorMensaje.textContent = 'Enviando enlace de recuperación...';
        errorMensaje.style.color = '#fff';

        // ✅ Cambiar la URL al endpoint que ya tienes en tu servidor
        const res = await fetch('/recuperar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.text(); // Tu servidor devuelve HTML en lugar de JSON

        if (res.ok) {
            // Analizar el mensaje del HTML para determinar el éxito
            if (data.includes('Correo enviado')) {
                errorMensaje.textContent = 'Se ha enviado un enlace de recuperación a tu correo.';
                errorMensaje.style.color = '#4caf50';
            } else {
                errorMensaje.textContent = 'Si el correo existe, se ha enviado un enlace.';
                errorMensaje.style.color = '#4caf50';
            }
        } else {
            errorMensaje.textContent = 'Error al enviar el enlace. Intenta de nuevo.';
            errorMensaje.style.color = '#ff4d4f';
        }
    } catch (err) {
        console.error('Error de conexión:', err);
        errorMensaje.textContent = 'Error en el servidor. Intenta más tarde.';
        errorMensaje.style.color = '#ff4d4f';
    }
});