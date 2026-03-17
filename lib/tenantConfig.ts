export interface TenantConfig {
  tenantName: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
  poweredByLabel: string;
}

export const torqueLabConfig: TenantConfig = {
  tenantName: "Torque Lab",
  logoPath: "/logos/torque_lab_logo.png",
  primaryColor: "#5DA62A",      // Verde Torque
  secondaryColor: "#262626",    // Gris Carbón de contraste (antes era Negro)
  poweredByLabel: "Powered by Scrum Manager Pro",
};

export const currentConfig = torqueLabConfig;