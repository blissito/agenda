export default ({ orgName, link }: { orgName: string; link: string }) => `
<body style="font-family:Arial;background-color:#F8F8F8; padding:24px ">
    <div style="min-width:360px; max-width:480px;  margin:0 auto;padding:24px;background-color:#ffffff; border-radius:24px;">
      <div>
        <img alt="logo" style="width:120px; margin-bottom:32px;" src="https://i.imgur.com/sunNMiV.png"/>
      </div>
      <div style="text-align:left; margin-top:24px; ">
        <h2 style="color:#15191E; font-size:20px; margin-top:24px">
        Te han invitado a colaborar en ${orgName}
        </h2>
        <p style="color:#4B5563; font-size:16px; margin-top:16px;">
          Haz clic en el siguiente enlace para acceder a la plataforma y comenzar a colaborar.
        </p>

        <a href="${link}" target="blank" style="display:inline-block; box-sizing:border-box; background:#5158F6; color:white; font-size:16px; font-family:Arial,sans-serif; font-weight:500; text-decoration:none; text-align:center; padding:14px 32px; border-radius:24px; min-width:200px; margin-top:32px;">
          Acceder a ${orgName}
        </a>

      </div>
       <div style="text-align:center; margin-top:64px; margin-bottom:16px">
           <p style="color:#4B5563; font-size:14px;">
          Denik. Tu agenda. Tus clientes. Tu negocio.
        </p>
        <a href="https://www.facebook.com/profile.php?id=61563700900314" target="blank" style="text-decoration:none;">
          <img alt="facebook" style="width:28px; height:28px" src="https://i.imgur.com/JvkVAdP.png"/>
        </a>
        <a href="https://www.linkedin.com/company/den%C3%ADk/" target="blank" style="text-decoration:none;">
          <img alt="linkedin" style="width:28px; height:28px" src="https://i.imgur.com/Y8zd5tO.png"/>
        </a>
        <a href="https://www.instagram.com/denik_agenda/" target="blank" style="text-decoration:none;">
          <img alt="instagram" style="width:28px; height:28px" src="https://i.imgur.com/cqGKCq6.png"/>
        </a>
        <a href="https://www.youtube.com/@Den%C3%ADk-v9s" target="blank" style="text-decoration:none;">
          <img alt="youtube" style="width:28px; height:28px" src="https://i.imgur.com/S92vVcz.png"/>
        </a>
      </div>
        <div style="text-align:center; margin-top:32px; margin-bottom:16px">
        <a href="https://www.denik.me" target="blank" style="text-decoration:none;">
            <p style="color:#4B5563;font-size:10px;cursor:pointer;">Derechos reservados Denik.me ${new Date().getFullYear()}</p>
        </a>
        </div>

    </div>
</body>
`
