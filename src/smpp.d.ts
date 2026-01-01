declare module 'smpp' {
  export interface PDU {
    command_status: number;
    command_id?: number;
    sequence_number?: number;
    [key: string]: any;
  }

  export interface BindOptions {
    system_id: string;
    password: string;
    interface_version?: number;
    system_type?: string;
    addr_ton?: number;
    addr_npi?: number;
    address_range?: string;
  }

  export interface SubmitSmOptions {
    source_addr: string;
    destination_addr: string;
    short_message: string;
    source_addr_ton?: number;
    source_addr_npi?: number;
    dest_addr_ton?: number;
    dest_addr_npi?: number;
    esm_class?: number;
    protocol_id?: number;
    priority_flag?: number;
    schedule_delivery_time?: string;
    validity_period?: string;
    registered_delivery?: number;
    replace_if_present_flag?: number;
    data_coding?: number;
    sm_default_msg_id?: number;
    [key: string]: any;
  }

  export interface Session {
    bind_transceiver(
      options: BindOptions,
      callback: (pdu: PDU) => void
    ): void;
    bind_transmitter(
      options: BindOptions,
      callback: (pdu: PDU) => void
    ): void;
    bind_receiver(options: BindOptions, callback: (pdu: PDU) => void): void;
    submit_sm(
      options: SubmitSmOptions,
      callback: (pdu: PDU) => void
    ): void;
    unbind(): void;
    close(): void;
    on(event: 'close', callback: () => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    on(event: 'pdu', callback: (pdu: PDU) => void): void;
    on(event: string, callback: (...args: any[]) => void): void;
  }

  export function connect(url: string): Session;
}
