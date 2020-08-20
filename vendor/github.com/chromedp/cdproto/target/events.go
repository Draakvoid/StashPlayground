package target

// Code generated by cdproto-gen. DO NOT EDIT.

// EventAttachedToTarget issued when attached to target because of
// auto-attach or attachToTarget command.
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Target#event-attachedToTarget
type EventAttachedToTarget struct {
	SessionID          SessionID `json:"sessionId"` // Identifier assigned to the session used to send/receive messages.
	TargetInfo         *Info     `json:"targetInfo"`
	WaitingForDebugger bool      `json:"waitingForDebugger"`
}

// EventDetachedFromTarget issued when detached from target for any reason
// (including detachFromTarget command). Can be issued multiple times per target
// if multiple sessions have been attached to it.
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Target#event-detachedFromTarget
type EventDetachedFromTarget struct {
	SessionID SessionID `json:"sessionId"` // Detached session identifier.
}

// EventReceivedMessageFromTarget notifies about a new protocol message
// received from the session (as reported in attachedToTarget event).
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Target#event-receivedMessageFromTarget
type EventReceivedMessageFromTarget struct {
	SessionID SessionID `json:"sessionId"` // Identifier of a session which sends a message.
	Message   string    `json:"message"`
}

// EventTargetCreated issued when a possible inspection target is created.
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Target#event-targetCreated
type EventTargetCreated struct {
	TargetInfo *Info `json:"targetInfo"`
}

// EventTargetDestroyed issued when a target is destroyed.
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Target#event-targetDestroyed
type EventTargetDestroyed struct {
	TargetID ID `json:"targetId"`
}

// EventTargetCrashed issued when a target has crashed.
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Target#event-targetCrashed
type EventTargetCrashed struct {
	TargetID  ID     `json:"targetId"`
	Status    string `json:"status"`    // Termination status type.
	ErrorCode int64  `json:"errorCode"` // Termination error code.
}

// EventTargetInfoChanged issued when some information about a target has
// changed. This only happens between targetCreated and targetDestroyed.
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Target#event-targetInfoChanged
type EventTargetInfoChanged struct {
	TargetInfo *Info `json:"targetInfo"`
}