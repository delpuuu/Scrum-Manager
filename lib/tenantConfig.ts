export interface TenantConfig {
  tenantName: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
  poweredByLabel: string;
}

export const torqueLabConfig: TenantConfig = {
  tenantName: "Torque Lab",
  logoPath: "/logos/torque_lab_logo.png", // Asegurate de tener el logo en public/logos/
  primaryColor: "#5DA62A",                // El verde de Torque Lab
  secondaryColor: "#000000",              // Negro
  poweredByLabel: "Powered by Scrum Manager Pro",
};

// Esta es la exportación que usa el Layout y las Pages
export const currentConfig = torqueLabConfig;