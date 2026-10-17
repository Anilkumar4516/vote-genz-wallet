/**
 * Environment & Service Configuration for Vote Wallet Mobile App
 */
class Env {
  static const String appName = 'Vote Wallet Mobile';
  static const String appVersion = '2.0.0';

  // Base API URLs (configurable via --dart-define or defaults to local dev bridges)
  static const String authServiceUrl = String.fromEnvironment(
    'AUTH_SERVICE_URL',
    defaultValue: 'http://10.0.2.2:3001', // Android emulator localhost alias
  );

  static const String votingServiceUrl = String.fromEnvironment(
    'VOTING_SERVICE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  static const String faceServiceUrl = String.fromEnvironment(
    'FACE_SERVICE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  static const String activeElectionId = 'elec_2026_national_general';

  // Timeout settings
  static const int connectTimeoutMs = 15000;
  static const int receiveTimeoutMs = 15000;
}
