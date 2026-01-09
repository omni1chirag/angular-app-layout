declare interface RazorpayOptions {
    /** * Mandatory. Your public API Key ID generated from the Razorpay Dashboard. */
    key: string;
    /** * Mandatory. The transaction amount in the smallest currency subunit (e.g., paise for INR, cents for USD). */
    amount: number;
    /** * Mandatory. The 3-letter currency code (e.g., 'INR', 'USD'). */
    currency: string;
    /** * Optional. Your Business/Enterprise name shown on the Checkout form. */
    name?: string;
    /** * Optional. A description of the purchase item shown on the Checkout form. */
    description?: string;
    /** * Optional. Link to an image (usually your business logo) shown on the Checkout form. */
    image?: string;
    /** * Mandatory. The Order ID generated via the Orders API on your server. */
    order_id?: string;
    /** * Optional. Used to prefill the customer's contact information. */
    prefill?: Prefill;
    /** * Optional. Set of key-value pairs to store additional information about the payment. */
    notes?: Record<string, string>;
    /** * Optional. A client-side function executed on successful payment. Receives the response object for signature verification. */
    handler?: (response: unknown) => void;
    /** * Optional. Thematic options to modify the appearance of the Checkout form. */
    theme?: Theme;
    /** * Optional. Options to handle the behavior of the Checkout modal/popup. */
    modal?: Modal;

    /*
     * --------------------------------------------------------------------------------------
     * Subscription & Recurring Payment Parameters (Not explicitly in the linked section 1.2.3,
     * but commonly part of the SDK options)
     * --------------------------------------------------------------------------------------
     */
    /** * Optional. Required to be passed if a payment for an existing subscription is being created. */
    subscription_id?: string;
    /** * Optional. Set to `true` to allow the customer to change the card for an existing subscription. */
    subscription_card_change?: boolean;
    /** * Optional. Set to `true` to enable recurring payment features (requires a plan/subscription). */
    recurring?: boolean;

    /*
     * --------------------------------------------------------------------------------------
     * Redirection and Flow Parameters
     * --------------------------------------------------------------------------------------
     */
    /** * Optional. Customers will be redirected to this URL on successful payment (alternative to handler). Must be allowlisted. */
    callback_url?: string;
    /** * Optional. Determines whether to redirect to the `callback_url` on payment failure as well. */
    redirect?: boolean;
    /** * Optional. The ID of an existing customer created via the Customers API. */
    customer_id?: string;
    /** * Optional. Indicates whether the customer's card details should be saved for future use. */
    remember_customer?: boolean;
    /** * Optional. Sets a timeout on Checkout, in seconds. After this time, the checkout cannot be used. */
    timeout?: number; // in seconds

    /*
     * --------------------------------------------------------------------------------------
     * Customization and SDK Behavior
     * --------------------------------------------------------------------------------------
     */
    /** * Optional. Marks fields (name, email, contact) as read-only, preventing customer editing. */
    readonly: ReadOnly;
    /** * Optional. Hides fields (email, contact) on the Checkout form. */
    hidden?: Hidden;
    /** * Optional. Used to auto-read OTP for card payments (Applicable for Android SDK only). */
    send_sms_hash?: boolean;
    /** * Optional. Used to rotate the payment page as per screen orientation (Applicable for Android SDK only). */
    allow_rotation?: boolean;
    /** * Optional. Parameters that control the payment retry mechanism on the checkout form. */
    retry?: Retry;
    /** * Optional. Custom configuration for the display language and payment methods. */
    config?: Config;
}

// --------------------------------------------------------------------------------------

declare interface Prefill {
    /** * Optional. Cardholder's name to be prefilled. */
    name?: string;
    /** * Optional. Email address of the customer to be prefilled. */
    email?: string;
    /** * Optional. Phone number of the customer to be prefilled (Format: +{country code}{phone number}). */
    contact?: string;
    /** * Optional. by default this method will be expanded. */
    method?: string;
}

declare interface Theme {
    /** * Optional. Your brand colour's HEX code to change the text, icons, and CTA button colour. */
    color?: string | "#1aa5b3";
    /** * Optional. Enter a HEX code to change the Checkout's backdrop colour. */
    backdrop_color?: string;
}

declare interface Modal {
    /** * Optional. Indicates whether clicking the translucent blank space outside the Checkout form should close the form. */
    backdropclose?: boolean;
    /** * Optional. Indicates whether pressing the escape key should close the Checkout form. */
    escape?: boolean;
    /** * Optional. Determines whether Checkout must behave similar to the browser when the back button is pressed. */
    handleback?: boolean;
    /** * Optional. Determines whether a confirmation dialog box should be shown if customers attempt to close Checkout. */
    confirm_close?: boolean;
    /** * Optional. Function called when the modal is closed by the user. */
    ondismiss?: () => void;
    /** * Optional. Shows an animation before loading of Checkout. */
    animation?: boolean;
}

// Note: Config, Display, Blocks, UpiBlock, and Instrument are part of the advanced payment method customization.

declare interface ReadOnly {
    /** * Optional. Set to `true` to prevent the customer from editing the name field. */
    name?: boolean;
    /** * Optional. Set to `true` to prevent the customer from editing the email field. */
    email?: boolean;
    /** * Optional. Set to `true` to prevent the customer from editing the contact field. */
    contact?: boolean;
}

declare interface Hidden {
    /** * Optional. Set to `true` to hide the email field on the Checkout form. */
    email?: boolean;
    /** * Optional. Set to `true` to hide the contact field on the Checkout form. */
    contact?: boolean;
}

declare interface Retry {
    /** * Optional. Determines whether the customers can retry payments on the checkout (Default: `true`). */
    enabled?: boolean;
    /** * Optional. The number of times the customer can retry the payment. Not supported in Web Integration. */
    max_count?: number;
}

declare interface Config {
    /** * Optional. Parameters that enable configuration of checkout display language and payment methods. */
    display: Display;
}

declare interface Display {
    /** * Optional. Child parameter that enables configuration of checkout display language. */
    language?: 'en' | 'ben' | 'hi' | 'mar' | 'guj' | 'tam' | 'tel' | string;

    /** * Optional. Custom blocks for payment methods. */
    blocks?: Blocks;

    /** * Optional. Array of instruments/methods to hide. */
    hide?: Instrument[];

    /** * Optional. Defines the order in which blocks appear (e.g., ["block.utib", "upi"]). */
    sequence?: string[];

    /** * Optional. Preferences for displaying default blocks. */
    preferences?: {
        /** * Should Checkout show its default payment method blocks? (Default: true) */
        show_default_blocks?: boolean;
    };
}

type Blocks = Record<string, CustomBlock>;

declare interface CustomBlock {
    name: string;
    instruments: Instrument[];
}

declare interface Instrument {
    method: "upi" | "card" | "netbanking" | "wallet" | "emi" | string;
    issuers?: string[];
    banks?: string[];
    networks?: string[];
    wallets?: string[];
    flows?: string[];
    apps?: string[];
    types?: string[];
    iins?: string[];
    providers?: string[];
}

// --------------------------------------------------------------------------------------

declare class Razorpay {
    /** * Initializes a new Razorpay Checkout instance with the provided options. */
    constructor(options: RazorpayOptions);
    /** * Opens the Razorpay Checkout modal for the customer. */
    open(): void;
    /** * Closes the Razorpay Checkout modal. */
    close(): void;
    /** * Used to listen to specific events during the payment process. */
    on(event: string, callback: (response: unknown) => void): void;
}

interface Window {
    /** * Global reference to the Razorpay class, available after the SDK script loads. */
    Razorpay: typeof Razorpay;
}