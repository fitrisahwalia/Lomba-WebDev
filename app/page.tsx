const redirectByRole = (targetRole: string) => {
  let targetPath = "/buyer"; // Jangan gunakan "/" agar tidak ditendang ke /home

  switch (targetRole) {
    case "superadmin":
      targetPath = "/admin/admin-ops/super-admin";
      break;
    case "adminops":
    case "admin":
      targetPath = "/admin/admin-ops";
      break;
    case "admintransport":
    case "kurir":
    case "supir":
      targetPath = "/transport";
      break;
    case "nelayan":
      targetPath = "/nelayan";
      break;
    case "pembeli":
      targetPath = "/buyer";
      break;
    default:
      targetPath = "/buyer";
      break;
  }

  window.location.href = targetPath;
};