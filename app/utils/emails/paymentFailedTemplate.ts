export default ({
  customerName,
  serviceName,
  orgName,
  retryLink,
}: {
  customerName: string
  serviceName: string
  orgName: string
  retryLink: string
}) => `
<body style="font-family:Arial; background-color:#F8F8F8;padding:24px;">
<div style="min-width:360px; max-width:480px; margin:0 auto;padding:24px; background-color:#ffffff; border-radius:24px;">
  <div>
    <img alt="logo" style="width:120px;" src="https://i.imgur.com/sunNMiV.png"/>
  </div>
  <div style="text-align:left; background:white; border-radius:16px; margin-top:16px;">
    <h2 style="color:#15191E; font-size:20px; margin-top:24px">${customerName}, tu pago no pudo procesarse</h2>
    <p style="margin-top:14px; color:#4B5563; font-size:16px;">El pago para <strong>${serviceName}</strong> en <strong>${orgName}</strong> fue rechazado.</p>
    <p style="color:#4B5563; font-size:16px;">Puedes intentarlo de nuevo con otro método de pago.</p>
    <a href="${retryLink}" target="blank" style="display:inline-block; box-sizing:border-box; background:#5158F6; color:white; font-size:16px; font-family:Arial,sans-serif; font-weight:500; text-decoration:none; text-align:center; padding:14px 32px; border-radius:24px; min-width:200px; margin-top:24px;">
        Intentar de nuevo
    </a>
  </div>
  <div style="text-align:center; margin-top:32px; margin-bottom:16px">
    <a href="https://www.denik.me" target="blank" style="text-decoration:none;">
      <p style="color:#5158F6;font-size:10px;cursor:pointer;">Derechos reservados Deník.me® ${new Date().getFullYear()}</p>
    </a>
  </div>
</div>
</body>
`
