const FLY_API_URL = "https://api.fly.io/graphql";
const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
const FLY_APP_NAME = process.env.FLY_APP_NAME || "denik";

// Configuration for retry and timeout
const FLY_REQUEST_TIMEOUT_MS = 15000; // 15 seconds
const FLY_MAX_RETRIES = 3;
const FLY_RETRY_BASE_DELAY_MS = 1000; // 1 second, doubles each retry

type CertificateStatus =
  | "Awaiting"
  | "Ready"
  | "Issued"
  | "Verified"
  | "Error";

interface CertificateResult {
  success: boolean;
  hostname?: string;
  status?: CertificateStatus;
  dnsValidationInstructions?: string;
  dnsValidationHostname?: string;
  dnsValidationTarget?: string;
  error?: string;
}

interface Certificate {
  hostname: string;
  clientStatus: CertificateStatus;
  dnsValidationInstructions?: string;
  dnsValidationHostname?: string;
  dnsValidationTarget?: string;
}

// Helper to delay for retry backoff
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Determines if an error is retryable (network/transient errors)
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("econnreset") ||
      message.includes("econnrefused") ||
      message.includes("socket") ||
      message.includes("503") ||
      message.includes("502") ||
      message.includes("429")
    );
  }
  return false;
}

// Sanitizes error messages to prevent leaking internal details to clients
function sanitizeErrorForClient(error: Error): string {
  const message = error.message.toLowerCase();

  // Map known error patterns to user-friendly messages
  if (message.includes("timeout") || message.includes("timed out")) {
    return "El servicio está tardando en responder. Intenta de nuevo.";
  }
  if (
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("econnrefused")
  ) {
    return "Error de conexión. Intenta de nuevo.";
  }
  if (message.includes("not configured")) {
    return "El servicio no está configurado correctamente.";
  }
  if (message.includes("already exists") || message.includes("duplicate")) {
    return "Este dominio ya está registrado.";
  }
  if (message.includes("not found")) {
    return "Certificado no encontrado.";
  }
  if (message.includes("invalid") || message.includes("malformed")) {
    return "El dominio tiene un formato inválido.";
  }

  // For any other error, return a generic message (don't leak internal details)
  console.error("[Fly.io Error]", error.message); // Log full error server-side
  return "Error al procesar la solicitud. Intenta de nuevo.";
}

async function flyGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!FLY_API_TOKEN) {
    throw new Error("FLY_API_TOKEN is not configured");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < FLY_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        FLY_REQUEST_TIMEOUT_MS
      );

      const response = await fetch(FLY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FLY_API_TOKEN}`,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(
          `Fly API error: ${response.status} ${response.statusText}`
        );
        // Retry on 5xx errors or rate limits
        if (response.status >= 500 || response.status === 429) {
          lastError = error;
          if (attempt < FLY_MAX_RETRIES - 1) {
            await delay(FLY_RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
            continue;
          }
        }
        throw error;
      }

      const result = await response.json();

      if (result.errors?.length) {
        // Extract first error message safely
        const errorMessage =
          result.errors[0]?.message || "Unknown GraphQL error";
        throw new Error(errorMessage);
      }

      return result.data;
    } catch (error) {
      // Handle abort (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        lastError = new Error("Request to Fly.io timed out");
      } else if (error instanceof Error) {
        lastError = error;
      } else {
        lastError = new Error("Unknown error occurred");
      }

      // Only retry on retryable errors
      if (isRetryableError(lastError) && attempt < FLY_MAX_RETRIES - 1) {
        await delay(FLY_RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error("Failed after retries");
}

export async function addCertificate(
  hostname: string
): Promise<CertificateResult> {
  const query = `
    mutation($appId: ID!, $hostname: String!) {
      addCertificate(appId: $appId, hostname: $hostname) {
        certificate {
          hostname
          clientStatus
          dnsValidationInstructions
          dnsValidationHostname
          dnsValidationTarget
        }
      }
    }
  `;

  try {
    const data = await flyGraphQL<{
      addCertificate: { certificate: Certificate };
    }>(query, { appId: FLY_APP_NAME, hostname });

    const cert = data.addCertificate.certificate;
    return {
      success: true,
      hostname: cert.hostname,
      status: cert.clientStatus,
      dnsValidationInstructions: cert.dnsValidationInstructions,
      dnsValidationHostname: cert.dnsValidationHostname,
      dnsValidationTarget: cert.dnsValidationTarget,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? sanitizeErrorForClient(error)
          : "Error al agregar el certificado",
    };
  }
}

export async function checkCertificate(
  hostname: string
): Promise<CertificateResult> {
  const query = `
    query($appName: String!, $hostname: String!) {
      app(name: $appName) {
        certificate(hostname: $hostname) {
          hostname
          clientStatus
          dnsValidationInstructions
          dnsValidationHostname
          dnsValidationTarget
          issued {
            nodes {
              type
              expiresAt
            }
          }
        }
      }
    }
  `;

  try {
    const data = await flyGraphQL<{
      app: { certificate: Certificate | null };
    }>(query, { appName: FLY_APP_NAME, hostname });

    const cert = data.app.certificate;
    if (!cert) {
      return {
        success: false,
        error: "Certificate not found",
      };
    }

    return {
      success: true,
      hostname: cert.hostname,
      status: cert.clientStatus,
      dnsValidationInstructions: cert.dnsValidationInstructions,
      dnsValidationHostname: cert.dnsValidationHostname,
      dnsValidationTarget: cert.dnsValidationTarget,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? sanitizeErrorForClient(error)
          : "Error al verificar el certificado",
    };
  }
}

export async function deleteCertificate(
  hostname: string
): Promise<{ success: boolean; error?: string }> {
  const query = `
    mutation($appId: ID!, $hostname: String!) {
      deleteCertificate(appId: $appId, hostname: $hostname) {
        app {
          name
        }
        certificate {
          hostname
        }
      }
    }
  `;

  try {
    await flyGraphQL(query, { appId: FLY_APP_NAME, hostname });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? sanitizeErrorForClient(error)
          : "Error al eliminar el certificado",
    };
  }
}

export async function listCertificates(): Promise<{
  success: boolean;
  certificates?: Certificate[];
  error?: string;
}> {
  const query = `
    query($appName: String!) {
      app(name: $appName) {
        certificates {
          nodes {
            hostname
            clientStatus
            dnsValidationInstructions
            dnsValidationHostname
            dnsValidationTarget
          }
        }
      }
    }
  `;

  try {
    const data = await flyGraphQL<{
      app: { certificates: { nodes: Certificate[] } };
    }>(query, { appName: FLY_APP_NAME });

    return {
      success: true,
      certificates: data.app.certificates.nodes,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? sanitizeErrorForClient(error)
          : "Error al listar los certificados",
    };
  }
}

export function mapFlyStatusToDbStatus(
  flyStatus: CertificateStatus
): "pending" | "validating" | "active" | "failed" {
  switch (flyStatus) {
    case "Awaiting":
      return "pending";
    case "Verified":
    case "Ready":
      return "validating";
    case "Issued":
      return "active";
    case "Error":
      return "failed";
    default:
      return "pending";
  }
}
