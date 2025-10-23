# Alert Queue Implementation

## Vấn đề đã giải quyết

Trước đây, khi có nhiều donation liên tiếp, donation alert trước chưa hiển thị xong đã bị tắt bởi alert tiếp theo. Điều này làm cho người xem không kịp thấy các donation alerts.

## Giải pháp đã implement

### 1. **BankSyncService - Queue System với Acknowledgment**

#### Thay đổi chính:
- **AlertState interface**: Thêm `currentAlertId` và `waitingForAck` để track alert hiện tại
- **Enhanced DonationAlert**: Thêm `alertId` và `timestamp` cho mỗi alert
- **Queue processing**: Chờ acknowledgment từ frontend trước khi gửi alert tiếp theo
- **Timeout fallback**: Nếu frontend không báo về, tự động tiếp tục sau timeout

#### Code chính:
```typescript
interface AlertState {
    queue: DonationAlert[];
    processing: boolean;
    inQueueRefs: Set<string>;
    currentAlertId?: string;
    waitingForAck: boolean;
}

// Process queue với acknowledgment
private async processQueue(streamerId: string): Promise<void> {
    // ... get settings ...
    
    while (state.queue.length > 0) {
        const next = state.queue.shift() as DonationAlert;
        
        // Set current alert và waiting state
        state.currentAlertId = next.alertId;
        state.waitingForAck = true;
        
        // Send alert với unique ID
        this.obsWidgetGateway.sendDonationAlertWithId(
            next.streamerId, next.donorName, next.amount, 
            next.currency, next.message, next.alertId
        );
        
        // Set timeout fallback
        const timeout = setTimeout(() => {
            this.handleAlertCompleted(streamerId, next.alertId!);
        }, displayDuration + 5000);
        
        // Wait for acknowledgment
        await this.waitForAlertCompletion(streamerId, next.alertId!);
    }
}
```

### 2. **OBSWidgetGateway - Enhanced Alert System**

#### Thay đổi chính:
- **sendDonationAlertWithId()**: Method mới để gửi alert với unique ID
- **alertCompleted handler**: Nhận acknowledgment từ frontend
- **Event forwarding**: Chuyển tiếp acknowledgment đến BankSyncService

#### Code chính:
```typescript
// Method mới để gửi alert với ID
async sendDonationAlertWithId(
    streamerId: string, 
    donorName: string, 
    amount: number, 
    currency: string, 
    message?: string,
    alertId?: string
) {
    // ... get settings logic ...
    
    const alert: OBSWidgetAlert = {
        type: 'donationAlert',
        streamerId,
        donorName,
        amount: `${amount} ${currency}`,
        message,
        timestamp: new Date(),
        alertId, // Include unique ID
        settings: alertSettings
    };
    
    this.server.to(roomName).emit('donationAlert', alert);
}

// Handler cho acknowledgment
@SubscribeMessage('alertCompleted')
handleAlertCompleted(client: Socket, data: { alertId: string, streamerId: string }) {
    this.server.emit('alertCompleted', { alertId: data.alertId, streamerId: data.streamerId });
}
```

### 3. **Frontend Widget - Queue Management**

#### Yêu cầu cho Frontend:
Frontend widget cần implement queue system để không bị ghi đè alerts:

```typescript
class AlertManager {
    private alertQueue: OBSWidgetAlert[] = [];
    private isProcessing = false;
    private currentAlert: OBSWidgetAlert | null = null;
    
    handleDonationAlert(alert: OBSWidgetAlert) {
        if (this.isProcessing) {
            // Queue alert nếu đang hiển thị alert khác
            this.alertQueue.push(alert);
        } else {
            this.displayAlert(alert);
        }
    }
    
    private async displayAlert(alert: OBSWidgetAlert) {
        this.isProcessing = true;
        this.currentAlert = alert;
        
        // Display alert
        await this.showAlert(alert);
        
        // Wait for animation/display to complete
        await this.waitForDisplayComplete(alert);
        
        // Notify server that alert is completed
        this.socket.emit('alertCompleted', {
            alertId: alert.alertId,
            streamerId: alert.streamerId
        });
        
        this.currentAlert = null;
        this.isProcessing = false;
        
        // Process next alert in queue
        if (this.alertQueue.length > 0) {
            const nextAlert = this.alertQueue.shift();
            this.displayAlert(nextAlert);
        }
    }
}
```

## Cách hoạt động

### Flow hoàn chỉnh:

1. **BankSyncService** nhận donation từ bank API
2. **Enqueue donation** với unique alertId
3. **Process queue** tuần tự:
   - Gửi alert với ID đến OBSWidgetGateway
   - Chờ acknowledgment từ frontend
   - Timeout fallback nếu không nhận được acknowledgment
4. **OBSWidgetGateway** gửi alert đến frontend widgets
5. **Frontend widget**:
   - Queue alerts nếu đang hiển thị
   - Hiển thị tuần tự
   - Báo về server khi hoàn thành
6. **BankSyncService** nhận acknowledgment và tiếp tục queue

### Lợi ích:

✅ **Không bị ghi đè alerts**: Mỗi alert được hiển thị đủ thời gian
✅ **Tuần tự processing**: Alerts hiển thị theo thứ tự
✅ **Timeout fallback**: Đảm bảo không bị stuck
✅ **Queue management**: Frontend tự động queue alerts
✅ **Unique tracking**: Mỗi alert có ID riêng để track

## Testing

### File test: `backend/public/widget/alert-queue-example.html`

File này cung cấp:
- **Visual demo** của queue system
- **Test controls** để test các scenarios:
  - Single alert
  - Multiple alerts (1 giây apart)
  - Rapid alerts (200ms apart)
- **Queue monitoring** để xem trạng thái queue
- **Real-time updates** của queue size và processing status

### Cách test:

1. Mở `http://localhost:3000/widget/alert-queue-example.html`
2. Click "Test Multiple Alerts" để test queue system
3. Click "Test Rapid Alerts" để test rapid donations
4. Quan sát queue info để thấy queue hoạt động

## Configuration

### Environment Variables:
- `BANK_POLL_CRON`: Cron expression cho bank polling
- `DARK_VCB_ENDPOINT`: VCB API endpoint
- `DARK_VCB_CODE`: VCB API code
- `DARK_VCB_COOKIE`: VCB API cookie

### OBS Settings:
- `displaySettings.duration`: Thời gian hiển thị alert (ms)
- Các settings khác cho customization

## Monitoring

### Logs để monitor:
- `Alert ${alertId} completed for streamer ${streamerId}`
- `Alert ${alertId} timeout for streamer ${streamerId}`
- `Queued alert ${alertId}, queue size: ${queueSize}`
- `Queue processing error for ${streamerId}`

### Metrics có thể track:
- Queue size per streamer
- Processing time per alert
- Timeout rate
- Alert completion rate

## Troubleshooting

### Nếu alerts bị stuck:
1. Check timeout logs
2. Verify frontend acknowledgment
3. Check WebSocket connection
4. Verify alertId uniqueness

### Nếu queue không hoạt động:
1. Check BankSyncService logs
2. Verify OBSWidgetGateway connection
3. Check frontend queue implementation
4. Verify alertId generation

## Future Improvements

1. **Priority queue**: Alerts với amount cao hơn được ưu tiên
2. **Batch processing**: Gộp alerts trong thời gian ngắn
3. **Analytics**: Track alert performance metrics
4. **Retry mechanism**: Retry failed alerts
5. **Queue persistence**: Lưu queue vào database để survive restart
