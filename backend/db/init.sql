-- Mimir Database Schema

CREATE TABLE IF NOT EXISTS devices (
    "id" SERIAL PRIMARY KEY,
    "uuid" UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    "deviceId" VARCHAR(20) UNIQUE NOT NULL,
    "deviceName" VARCHAR(100) NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "architecture" VARCHAR(50),
    "osVersion" VARCHAR(50),
    "publicIp" VARCHAR(45),
    "privateIp" VARCHAR(45),
    "status" VARCHAR(20) DEFAULT 'offline',
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeat" TIMESTAMP WITH TIME ZONE,
    "lastSeen" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS heartbeats (
    "id" SERIAL PRIMARY KEY,
    "deviceId" VARCHAR(20) NOT NULL REFERENCES devices("deviceId") ON DELETE CASCADE,
    "publicIp" VARCHAR(45),
    "connectionQuality" VARCHAR(50),
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_rotations (
    "id" SERIAL PRIMARY KEY,
    "deviceId" VARCHAR(20) NOT NULL REFERENCES devices("deviceId") ON DELETE CASCADE,
    "oldHash" VARCHAR(255),
    "newHash" VARCHAR(255) NOT NULL,
    "rotatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scaffold tables for future usage
CREATE TABLE IF NOT EXISTS users (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connections (
    "id" SERIAL PRIMARY KEY,
    "hostDeviceId" VARCHAR(20) NOT NULL REFERENCES devices("deviceId"),
    "clientDeviceId" VARCHAR(20) NOT NULL REFERENCES devices("deviceId"),
    "status" VARCHAR(20) NOT NULL,
    "startedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    "id" SERIAL PRIMARY KEY,
    "action" VARCHAR(100) NOT NULL,
    "actor" VARCHAR(100),
    "target" VARCHAR(100),
    "details" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
