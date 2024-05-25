---
title: Docker
sidebar:
  order: 3
---

The application can be run in Docker with some limitations.

## Limitations

- MIDI is not supported

## Usage

- `docker run -p 3000:3000 -p 8000:8000 jwetzell/showbridge:v0.6.2`

## Persistance

The config and vars JSON files are stored in `/data` so any method supported by docker to persist data should be supported here.

### Docker Volume
- `docker run -p 3000:3000 -p 8000:8000 -v showbridge:/data jwetzell/showbridge:v0.6.2`
- `docker run -p 3000:3000 -p 8000:8000 -v /some/location/on/your/setup:/data jwetzell/showbridge:v0.6.2`
