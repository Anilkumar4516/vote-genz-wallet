# Vote Wallet: Unified Open API Specification

## 1. Authentication Service (`:3001`)

### `POST /auth/login`
Initiates voter session and sends 6-digit one-time passcode to the citizen's registered mobile number.
- **Request Body**:
  ```json
  {
    "nationalId": "EPIC987654321",
    "phoneNumber": "+919876543210"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "sessionId": "sess_8f39a012c4",
    "phoneMasked": "•••••••210",
    "expiresInSeconds": 300
  }
  ```

### `POST /auth/verify-otp`
Validates two-factor passcode and returns a short-lived bearer JWT.
- **Request Body**:
  ```json
  {
    "sessionId": "sess_8f39a012c4",
    "otp": "123456"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
  ```

### `GET /voter/me`
Retrieves authenticated voter's demographic card and eligibility status.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "id": "vtr_01",
    "nationalId": "EPIC987654321",
    "fullName": "Suresh Kumar Sharma",
    "constituencyCode": "AC-142 Bangalore South",
    "pollingStation": "Government High School, Room 4",
    "hasVoted": false
  }
  ```

---

## 2. Facial Biometrics Service (`:8000`)

### `GET /verify/challenge`
Generates a cryptographically random liveness challenge sequence.
- **Response `200 OK`**:
  ```json
  {
    "challengeId": "chal_98a7c12",
    "actions": ["blink", "turn_left"],
    "expiresAt": 1776432000000
  }
  ```

### `POST /verify/face`
Verifies captured face frame and motion against stored template.
- **Request Body**:
  ```json
  {
    "challengeId": "chal_98a7c12",
    "image": "<base64_encoded_jpeg>",
    "completedActions": ["blink", "turn_left"]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "verified": true,
    "confidence": 0.992
  }
  ```

---

## 3. Voting Microservice (`:3002`)

### `POST /token/issue`
Issues an anonymous single-use vote token dissociated from the voter identity.
- **Headers**: `Authorization: Bearer <voter_token>`
- **Response `200 OK`**:
  ```json
  {
    "voteToken": "vtoken_9f81a7b2c01e",
    "expiresAt": 1776432300000
  }
  ```

### `POST /ballot/cast`
Encrypted ballot submission. Absolutely NO voter ID is included in request.
- **Request Body**:
  ```json
  {
    "electionId": "elc_general_2026",
    "encryptedVote": "<ciphertext_rsa_oaep_or_aes_gcm>",
    "voteToken": "vtoken_9f81a7b2c01e",
    "trackerHash": "0x8f43b1298c56e39a04bd8e32912a77f98c43912a9bc4821a98e21938ab491204"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "ballotId": "blt_7f39a1c89012",
    "trackerHash": "0x8f43b1298c56e39a04bd8e32912a77f98c43912a9bc4821a98e21938ab491204",
    "merkleRoot": "0x12a9ef43b1298c56e39a04bd8e32912a77f98c43912a9bc4821a98e21938ab49",
    "merkleIndex": 41829,
    "timestamp": "2026-10-17T14:30:00Z"
  }
  ```
