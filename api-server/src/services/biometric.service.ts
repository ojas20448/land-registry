import axios from 'axios';

/**
 * Biometric Verification Service
 * Integrates with UIDAI biometric authentication API
 */
export class BiometricService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.BIOMETRIC_VERIFY_API_URL || 'https://biometric-api.gov.in/v1';
    this.apiKey = process.env.BIOMETRIC_API_KEY || '';
  }

  /**
   * Verify biometric authentication (fingerprint/iris)
   * @param aadhaarId - Aadhaar number
   * @param biometricData - Base64 encoded biometric data
   * @param biometricType - 'FINGERPRINT' | 'IRIS' | 'FACE'
   */
  async verifyBiometric(
    aadhaarId: string,
    biometricData: string,
    biometricType: 'FINGERPRINT' | 'IRIS' | 'FACE' = 'FINGERPRINT'
  ): Promise<{
    verified: boolean;
    confidence: number;
    name: string;
    aadhaarId: string;
  }> {
    try {
      console.log(`🔐 Verifying biometric for Aadhaar: ${aadhaarId}`);

      // In production, this would call actual UIDAI biometric API
      // For now, stub implementation
      
      /*
      const response = await axios.post(
        `${this.baseUrl}/verify`,
        {
          aadhaarNumber: aadhaarId,
          biometricData: biometricData,
          biometricType: biometricType,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        verified: response.data.verified,
        confidence: response.data.confidence,
        name: response.data.name,
        aadhaarId: response.data.aadhaarNumber,
      };
      */

      // Stub: simulate successful verification
      return {
        verified: true,
        confidence: 95.5,
        name: 'John Doe',
        aadhaarId: aadhaarId,
      };
    } catch (error) {
      console.error('Biometric verification failed:', error);
      throw new Error('Biometric verification failed');
    }
  }

  /**
   * Verify Aadhaar OTP (alternative to biometric)
   */
  async verifyAadhaarOTP(
    aadhaarId: string,
    otp: string,
    transactionId: string
  ): Promise<{
    verified: boolean;
    name: string;
    aadhaarId: string;
  }> {
    try {
      console.log(`📱 Verifying Aadhaar OTP for: ${aadhaarId}`);

      // In production, call UIDAI OTP verification API
      
      // Stub: simulate OTP verification
      return {
        verified: otp === '123456', // For demo purposes
        name: 'John Doe',
        aadhaarId: aadhaarId,
      };
    } catch (error) {
      console.error('Aadhaar OTP verification failed:', error);
      throw new Error('OTP verification failed');
    }
  }

  /**
   * Request Aadhaar OTP
   */
  async requestAadhaarOTP(aadhaarId: string): Promise<{ transactionId: string }> {
    try {
      console.log(`📤 Requesting OTP for Aadhaar: ${aadhaarId}`);

      // In production, call UIDAI OTP request API
      
      // Stub: generate transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return { transactionId };
    } catch (error) {
      console.error('Failed to request Aadhaar OTP:', error);
      throw new Error('OTP request failed');
    }
  }

  /**
   * Get Aadhaar eKYC data
   */
  async getEKYCData(aadhaarId: string, otp: string, transactionId: string): Promise<any> {
    try {
      console.log(`📋 Fetching eKYC data for Aadhaar: ${aadhaarId}`);

      // In production, call UIDAI eKYC API
      
      // Stub: return sample eKYC data
      return {
        aadhaarId: aadhaarId,
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        gender: 'M',
        address: {
          house: '123',
          street: 'Main Street',
          landmark: 'Near Temple',
          locality: 'Sample Locality',
          vtc: 'Sample Village',
          district: 'Sample District',
          state: 'Sample State',
          pincode: '123456',
        },
        photo: 'base64-encoded-photo-data',
      };
    } catch (error) {
      console.error('Failed to fetch eKYC data:', error);
      throw new Error('eKYC fetch failed');
    }
  }
}

export const biometricService = new BiometricService();
