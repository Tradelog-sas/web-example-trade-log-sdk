import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TradeLogWeb,
  type TradeLogChatEvent,
  type TradeLogHostDataRequest,
  type TradeLogHostDataResponse,
  type TradeLogWebInstance,
} from '@tradelog/support-sdk-web';

import { environment } from '../environments/environment';

interface EventLogItem {
  id: number;
  timestamp: string;
  title: string;
  payload: unknown;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sdkHost', { static: true })
  private readonly sdkHost!: ElementRef<HTMLElement>;

  protected readonly form = {
    apiKey: environment.apiKey,
    tenantId: environment.tenantId,
    customerName: 'Cliente Angular',
    customerData: 'cliente.angular@example.com',
  };

  protected events: EventLogItem[] = [];

  private sdk?: TradeLogWebInstance;
  private eventId = 0;

  ngAfterViewInit(): void {
    setTimeout(() => this.mountSdk());
  }

  ngOnDestroy(): void {
    this.sdk?.unmount();
  }

  protected mountSdk(): void {
    this.sdk?.unmount();

    this.sdk = TradeLogWeb.mount({
      target: this.sdkHost.nativeElement,
      initOptions: {
        apiKey: this.form.apiKey,
        tenantId: this.form.tenantId,
        environment: environment.environment,
        enableLogs: true,
        officialModules: ['logger', 'chatEvents', 'userInfo'],
        requestCustomerInfo: false,
        initialCustomerName: this.form.customerName,
        initialCustomerData: this.form.customerData,
        hasHostDataProvider: true,
        uiConfigurationCacheDurationSeconds: 60,
      },
      callbacks: {
        onCloseRequested: () => this.logEvent('close requested'),
        onBackButtonRequested: () => this.logEvent('back requested'),
        onChatEvent: (event) => this.handleChatEvent(event),
        onHostDataRequest: (request) => this.handleHostDataRequest(request),
      },
    });

    this.logEvent('sdk mounted', {
      sessionId: this.sdk.sessionId,
    });
  }

  protected unmountSdk(): void {
    this.sdk?.unmount();
    this.sdk = undefined;
    this.logEvent('sdk unmounted');
  }

  protected clearEvents(): void {
    this.events = [];
  }

  private handleChatEvent(event: TradeLogChatEvent): void {
    this.logEvent('chat event', event);
  }

  private handleHostDataRequest(
    request: TradeLogHostDataRequest,
  ): TradeLogHostDataResponse {
    this.logEvent('host data requested', request);
    return {
      status: 'success',
      data: {
        order_status: 'delivered',
        loyalty_tier: 'gold',
        source: 'angular-host',
      },
      errorMessage: null,
    };
  }

  private logEvent(title: string, payload: unknown = {}): void {
    this.events = [
      {
        id: ++this.eventId,
        timestamp: new Date().toLocaleTimeString(),
        title,
        payload,
      },
      ...this.events,
    ];
  }
}
