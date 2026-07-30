export interface BaseSignalPayload {
  sourceId?: string; // Appended by backend
  targetId: string;
}

export interface RequestPayload extends BaseSignalPayload {
  deviceName: string;
  platform: string;
  passwordHash: string; // Used to authenticate with Host device directly
}

export interface ApprovalPayload extends BaseSignalPayload {
  approved: boolean;
  reason?: string;
}

export interface OfferPayload extends BaseSignalPayload {
  sdp: RTCSessionDescriptionInit;
}

export interface AnswerPayload extends BaseSignalPayload {
  sdp: RTCSessionDescriptionInit;
}

export interface IcePayload extends BaseSignalPayload {
  candidate: RTCIceCandidateInit;
}
