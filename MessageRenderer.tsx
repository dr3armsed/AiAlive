

import React from 'react';
import type { ChatMessage } from '@/types';
import { useMetacosmState } from '@/context';
import MessageEgregore from './MessageEgregore';
import MessageScanner from './MessageScanner';
import MessageFRF from './MessageFRF';
import MessageUpgradeProposal from './MessageUpgradeProposal';
import MessageCombatEvent from './MessageCombatEvent';
import MessageSystemModification from './MessageSystemModification';

// --- Main Message Renderer ---
interface MessageRendererProps {
    message: ChatMessage;
}

const MessageRenderer = ({ message }: MessageRendererProps) => {
    const { egregores } = useMetacosmState();
    
    // Check for Combat Event first
    if (message.combat_event) {
        return <MessageCombatEvent message={message} />;
    }

    // Check for System Modification Proposal
    if (message.system_modification_proposal) {
        return <MessageSystemModification message={message} />;
    }

    // Check for Upgrade Proposal
    if (message.upgrade_proposal) {
        return <MessageUpgradeProposal message={message} />;
    }

    const senderEntity = egregores.find(e => e.id === message.sender);

    // Check for FRF message
    if (senderEntity?.is_core_frf) {
        return <MessageFRF message={message} />;
    }

    // Check for regular Egregore or Architect message
    if (message.sender === 'Architect' || senderEntity) {
        return <MessageEgregore message={message} />;
    }

    // Check for Scanner/System message
    if (message.sender === 'Metacosm' || message.sender === 'Anomaly') {
        return <MessageScanner message={message} />;
    }

    // Fallback to a default renderer if no specific case matches
    return <MessageEgregore message={message} />;
};

export default MessageRenderer;