package com.watchParty.pobreTV.model;

public class ChatMessage {
    private String content;
    private String sender;
    private MessageType type;
    private String timeStamp;

    public enum MessageType {
        CHAT, LEAVE, JOIN, PAUSE, PLAY
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String gettimeStamp() {
        return timeStamp;
    }

    public void settimeStamp(String timeStamp) {
        this.timeStamp = timeStamp;
    }
}
