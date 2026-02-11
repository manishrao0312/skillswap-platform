import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket, connectSocket } from '../services/socket';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
};

export default function VideoPage() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [remoteUser, setRemoteUser] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        initializeMedia();
        setupSocketListeners();

        return () => {
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (isConnected) {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isConnected]);

    const initializeMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
                audio: { echoCancellation: true, noiseSuppression: true }
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Join the room
            const socket = getSocket() || connectSocket(user.id);
            socket.emit('webrtc:join', { roomId, userId: user.id });
        } catch (err) {
            console.error('Media access error:', err);
        }
    };

    const setupSocketListeners = () => {
        const socket = getSocket() || connectSocket(user.id);

        socket.on('webrtc:user-joined', async ({ userId, socketId }) => {
            setRemoteUser(userId);
            await createPeerConnection(socketId);
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket.emit('webrtc:offer', { offer, roomId, to: socketId });
        });

        socket.on('webrtc:offer', async ({ offer, from, userId }) => {
            setRemoteUser(userId);
            await createPeerConnection(from);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socket.emit('webrtc:answer', { answer, to: from });
        });

        socket.on('webrtc:answer', async ({ answer }) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on('webrtc:ice-candidate', async ({ candidate }) => {
            if (peerConnectionRef.current && candidate) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error('ICE candidate error:', err);
                }
            }
        });

        socket.on('webrtc:user-left', () => {
            setIsConnected(false);
            setRemoteUser(null);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });
    };

    const createPeerConnection = async (targetSocketId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle remote stream
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setIsConnected(true);
            }
        };

        // ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const socket = getSocket();
                socket?.emit('webrtc:ice-candidate', {
                    candidate: event.candidate,
                    to: targetSocketId,
                    roomId
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'connected') setIsConnected(true);
            if (pc.iceConnectionState === 'disconnected') setIsConnected(false);
        };
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                const sender = peerConnectionRef.current
                    ?.getSenders()
                    .find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(screenTrack);

                if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

                screenTrack.onended = () => {
                    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
                    if (sender && videoTrack) sender.replaceTrack(videoTrack);
                    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
                    setIsScreenSharing(false);
                };

                setIsScreenSharing(true);
            } else {
                const videoTrack = localStreamRef.current?.getVideoTracks()[0];
                const sender = peerConnectionRef.current
                    ?.getSenders()
                    .find(s => s.track?.kind === 'video');
                if (sender && videoTrack) sender.replaceTrack(videoTrack);
                if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
                setIsScreenSharing(false);
            }
        } catch (err) {
            console.error('Screen share error:', err);
        }
    };

    const endCall = () => {
        cleanup();
        navigate('/chat');
    };

    const cleanup = () => {
        const socket = getSocket();
        socket?.emit('webrtc:leave', { roomId, userId: user?.id });

        localStreamRef.current?.getTracks().forEach(track => track.stop());
        peerConnectionRef.current?.close();
        clearInterval(timerRef.current);
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="video-page">
            <div className="video-container">
                {/* Session Info */}
                <div className="video-session-info">
                    {isConnected && <div className="recording-dot"></div>}
                    <span>{isConnected ? `Connected • ${formatDuration(callDuration)}` : 'Waiting for peer...'}</span>
                </div>

                {/* Remote Video */}
                <div className="video-stream">
                    <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {!isConnected && (
                        <div className="video-placeholder">
                            <div className="avatar-lg">?</div>
                            <p>Waiting for peer to join...</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Share room code: <strong style={{ color: 'var(--accent-tertiary)' }}>{roomId}</strong></p>
                        </div>
                    )}
                    <div className="video-stream-label">Remote User</div>
                </div>

                {/* Local Video */}
                <div className="video-stream" style={{ maxHeight: '300px' }}>
                    <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    {isVideoOff && (
                        <div className="video-placeholder">
                            <div className="avatar-lg">{user?.name?.charAt(0) || '?'}</div>
                            <p>Camera Off</p>
                        </div>
                    )}
                    <div className="video-stream-label">You {isScreenSharing ? '(Screen)' : ''}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="video-controls">
                <button className={`control-btn ${isMuted ? '' : 'active'}`} onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? '🔇' : '🎤'}
                </button>
                <button className={`control-btn ${isVideoOff ? '' : 'active'}`} onClick={toggleVideo} title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}>
                    {isVideoOff ? '📷' : '📹'}
                </button>
                <button className={`control-btn ${isScreenSharing ? 'active' : ''}`} onClick={toggleScreenShare} title="Share Screen">
                    🖥️
                </button>
                <button className="control-btn end-call" onClick={endCall} title="End Call">
                    📞
                </button>
            </div>
        </div>
    );
}
