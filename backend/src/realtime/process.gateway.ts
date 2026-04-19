import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ProcessGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('process.subscribe')
  handleSubscribe(
    @MessageBody() body: { processId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`process:${body.processId}`);
    client.emit('process.subscribed', {
      processId: body.processId,
    });
  }

  @SubscribeMessage('process.unsubscribe')
  handleUnsubscribe(
    @MessageBody() body: { processId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`process:${body.processId}`);
    client.emit('process.unsubscribed', {
      processId: body.processId,
    });
  }

  private toProcessRoom(processId: string) {
    return this.server.to(`process:${processId}`);
  }

  emitProcessQueued(processId: string) {
    this.toProcessRoom(processId).emit('process.queued', {
      processId,
      status: 'PENDING',
    });
  }

  emitProcessStarted(processId: string, totalDocuments: number) {
    this.toProcessRoom(processId).emit('process.started', {
      processId,
      status: 'RUNNING',
      totalDocuments,
    });
  }

  emitProcessProgress(
    processId: string,
    processedDocuments: number,
    totalDocuments: number,
  ) {
    const percentage =
      totalDocuments === 0
        ? 0
        : Math.round((processedDocuments / totalDocuments) * 100);

    this.toProcessRoom(processId).emit('process.progress', {
      processId,
      processedDocuments,
      totalDocuments,
      percentage,
    });
  }

  emitDocumentProcessing(
    processId: string,
    documentId: string,
    originalName?: string,
  ) {
    this.toProcessRoom(processId).emit('document.processing', {
      processId,
      documentId,
      originalName,
      status: 'PROCESSING',
    });
  }

  emitDocumentCompleted(
    processId: string,
    documentId: string,
    originalName?: string,
  ) {
    this.toProcessRoom(processId).emit('document.completed', {
      processId,
      documentId,
      originalName,
      status: 'DONE',
    });
  }

  emitDocumentFailed(
    processId: string,
    documentId: string,
    originalName: string | undefined,
    message: string,
  ) {
    this.toProcessRoom(processId).emit('document.failed', {
      processId,
      documentId,
      originalName,
      status: 'FAILED',
      message,
    });
  }

  emitProcessCompleted(processId: string, processedDocuments: number) {
    this.toProcessRoom(processId).emit('process.completed', {
      processId,
      status: 'COMPLETED',
      processedDocuments,
    });
  }

  emitProcessFailed(processId: string, message: string) {
    this.toProcessRoom(processId).emit('process.failed', {
      processId,
      status: 'FAILED',
      message,
    });
  }

  emitProcessPaused(processId: string) {
    this.toProcessRoom(processId).emit('process.paused', {
      processId,
      status: 'PAUSED',
    });
  }

  emitProcessResumed(processId: string) {
    this.toProcessRoom(processId).emit('process.resumed', {
      processId,
      status: 'PENDING',
    });
  }

  emitProcessStopped(processId: string) {
    this.toProcessRoom(processId).emit('process.stopped', {
      processId,
      status: 'STOPPED',
    });
  }
}