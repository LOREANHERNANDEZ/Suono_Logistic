const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Aquí configura tu servicio de correo.
    // Ejemplo para Gmail, usando una "App Password" por seguridad:
    service: 'gmail',
    auth: {
        user: 'tu_correo@gmail.com', // Reemplaza con tu correo
        pass: 'tu_contraseña_de_aplicación' // Reemplaza con tu contraseña de app
    }
});

const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `http://localhost:3000/portal/restablecer-contraseña.html?token=${token}`; // Asegúrate de que esta URL coincida con la de tu frontend

    const mailOptions = {
        from: 'tu_correo@gmail.com',
        to: email,
        subject: 'Restablecimiento de Contraseña',
        html: `
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            <a href="${resetLink}">Restablecer Contraseña</a>
            <p>Si no solicitaste esto, puedes ignorar este correo.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo de restablecimiento enviado a ${email}`);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('Error al enviar el correo de recuperación.');
    }
};

module.exports = sendPasswordResetEmail;