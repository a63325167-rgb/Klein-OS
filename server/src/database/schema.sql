-- Amazon SP-API Integration Database Schema (B8)
-- Multi-tenant data model for sellers, products, orders, and metrics

-- ============================================
-- SELLERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- FK to SaaS users table
    amazon_seller_id VARCHAR(255) NOT NULL,
    default_marketplace_id VARCHAR(50) NOT NULL,
    
    -- OAuth tokens (encrypted in application layer)
    lwa_refresh_token TEXT NOT NULL,
    lwa_access_token TEXT,
    lwa_access_token_expires_at TIMESTAMP,
    
    -- Seller info
    seller_name VARCHAR(255),
    seller_email VARCHAR(255),
    business_type VARCHAR(50),
    
    -- Sync status
    last_sync_at TIMESTAMP,
    last_sync_status VARCHAR(50) DEFAULT 'pending',
    last_sync_error TEXT,
    sync_enabled BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(amazon_seller_id),
    INDEX idx_user_id (user_id),
    INDEX idx_seller_id (amazon_seller_id)
);

-- ============================================
-- MARKETPLACES
-- ============================================

CREATE TABLE IF NOT EXISTS marketplaces (
    id VARCHAR(50) PRIMARY KEY, -- e.g., "A1PA6795UKMFR9" for Germany
    country_code CHAR(2) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    region VARCHAR(10) NOT NULL, -- 'eu', 'na', 'fe'
    domain VARCHAR(100),
    default_language CHAR(5),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate common marketplaces
INSERT INTO marketplaces (id, country_code, country_name, currency_code, region, domain, default_language) VALUES
('A1PA6795UKMFR9', 'DE', 'Germany', 'EUR', 'eu', 'amazon.de', 'de_DE'),
('A1F83G8C2ARO7P', 'GB', 'United Kingdom', 'GBP', 'eu', 'amazon.co.uk', 'en_GB'),
('A13V1IB3VIYZZH', 'FR', 'France', 'EUR', 'eu', 'amazon.fr', 'fr_FR'),
('APJ6JRA9NG5V4', 'IT', 'Italy', 'EUR', 'eu', 'amazon.it', 'it_IT'),
('A1RKKUPIHCS9HS', 'ES', 'Spain', 'EUR', 'eu', 'amazon.es', 'es_ES'),
('ATVPDKIKX0DER', 'US', 'United States', 'USD', 'na', 'amazon.com', 'en_US'),
('A2EUQ1WTGCTBG2', 'CA', 'Canada', 'CAD', 'na', 'amazon.ca', 'en_CA'),
('A1AM78C64UM0Y8', 'MX', 'Mexico', 'MXN', 'na', 'amazon.com.mx', 'es_MX'),
('A39IBJ37TRP1C6', 'AU', 'Australia', 'AUD', 'fe', 'amazon.com.au', 'en_AU'),
('A1VC38T7YXB528', 'JP', 'Japan', 'JPY', 'fe', 'amazon.co.jp', 'ja_JP')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCTS (from SP-API Catalog/Listings)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    marketplace_id VARCHAR(50) NOT NULL REFERENCES marketplaces(id),
    
    -- Identifiers
    asin VARCHAR(10) NOT NULL,
    sku VARCHAR(255) NOT NULL,
    fnsku VARCHAR(10), -- Fulfillment Network SKU
    
    -- Product info
    title TEXT,
    brand VARCHAR(255),
    category VARCHAR(255),
    subcategory VARCHAR(255),
    product_type VARCHAR(100),
    image_url TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, suppressed
    condition_type VARCHAR(50) DEFAULT 'new', -- new, used, refurbished
    fulfillment_channel VARCHAR(50) DEFAULT 'FBA', -- FBA or FBM
    
    -- Pricing (latest from SP-API)
    current_price DECIMAL(10, 2),
    currency_code CHAR(3),
    
    -- User-provided costs (not from SP-API)
    cogs_per_unit DECIMAL(10, 2),
    shipping_cost_per_unit DECIMAL(10, 2) DEFAULT 2.00,
    prep_cost_per_unit DECIMAL(10, 2) DEFAULT 0,
    
    -- Sync metadata
    synced_from_sp_api BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(seller_id, sku, marketplace_id),
    INDEX idx_asin (asin),
    INDEX idx_sku (sku),
    INDEX idx_seller_marketplace (seller_id, marketplace_id),
    INDEX idx_status (status)
);

-- ============================================
-- PRODUCT METRICS (Calculated from B1-B7)
-- ============================================

CREATE TABLE IF NOT EXISTS product_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    marketplace_id VARCHAR(50) NOT NULL REFERENCES marketplaces(id),
    
    -- Input metrics (derived from SP-API)
    selling_price DECIMAL(10, 2),
    cogs_per_unit DECIMAL(10, 2),
    landed_cost DECIMAL(10, 2),
    monthly_sales_velocity DECIMAL(10, 2) DEFAULT 0,
    return_rate_percent DECIMAL(5, 2) DEFAULT 5.00,
    
    -- Amazon fees (derived from settlements)
    referral_fee_percent DECIMAL(5, 2) DEFAULT 15.00,
    fba_fee_per_unit DECIMAL(10, 2) DEFAULT 0,
    storage_fee_per_unit DECIMAL(10, 2) DEFAULT 0,
    vat_percent DECIMAL(5, 2) DEFAULT 19.00,
    
    -- Calculated profitability (B2, B6)
    revenue_after_returns DECIMAL(10, 2),
    profit_per_unit DECIMAL(10, 2),
    profit_margin_percent DECIMAL(5, 2),
    total_monthly_profit DECIMAL(10, 2),
    
    -- Calculated time metrics (B6)
    break_even_days INTEGER,
    inventory_turnover_days INTEGER,
    
    -- Calculated cash flow (B4)
    cash_runway_months DECIMAL(5, 2),
    initial_inventory_cost DECIMAL(10, 2),
    monthly_reorder_cost DECIMAL(10, 2),
    
    -- Health score (B1)
    health_score INTEGER,
    
    -- Risk levels (B5)
    profitability_risk_level VARCHAR(10), -- red, yellow, green
    breakeven_risk_level VARCHAR(10),
    cashflow_risk_level VARCHAR(10),
    competition_risk_level VARCHAR(10),
    inventory_risk_level VARCHAR(10),
    critical_risks_count INTEGER DEFAULT 0,
    
    -- Competition (derived from external sources or user input)
    competitor_count INTEGER DEFAULT 0,
    average_competitor_rating DECIMAL(3, 2) DEFAULT 0,
    
    -- Calculation metadata
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculation_version VARCHAR(20), -- track which calculation logic was used
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_product_id (product_id),
    INDEX idx_health_score (health_score),
    INDEX idx_profit_margin (profit_margin_percent),
    INDEX idx_risks (profitability_risk_level, breakeven_risk_level, cashflow_risk_level)
);

-- ============================================
-- ORDERS (from SP-API Orders API)
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    
    -- Amazon identifiers
    amazon_order_id VARCHAR(50) NOT NULL UNIQUE,
    marketplace_id VARCHAR(50) NOT NULL REFERENCES marketplaces(id),
    
    -- Order details
    order_status VARCHAR(50), -- Pending, Unshipped, Shipped, Canceled, etc.
    fulfillment_channel VARCHAR(50), -- FBA, FBM
    sales_channel VARCHAR(100),
    order_type VARCHAR(50),
    
    -- Dates
    purchase_date TIMESTAMP,
    last_update_date TIMESTAMP,
    earliest_ship_date TIMESTAMP,
    latest_ship_date TIMESTAMP,
    
    -- Totals
    currency_code CHAR(3),
    order_total_amount DECIMAL(10, 2),
    order_tax_amount DECIMAL(10, 2),
    shipping_total_amount DECIMAL(10, 2),
    
    -- Buyer info (restricted data - only if needed)
    buyer_email VARCHAR(255),
    buyer_name VARCHAR(255),
    
    -- Sync metadata
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_seller_id (seller_id),
    INDEX idx_amazon_order_id (amazon_order_id),
    INDEX idx_purchase_date (purchase_date),
    INDEX idx_order_status (order_status)
);

-- ============================================
-- ORDER ITEMS (from SP-API Orders API)
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    
    -- Amazon identifiers
    order_item_id VARCHAR(50) NOT NULL,
    asin VARCHAR(10) NOT NULL,
    sku VARCHAR(255) NOT NULL,
    
    -- Item details
    title TEXT,
    quantity_ordered INTEGER,
    quantity_shipped INTEGER DEFAULT 0,
    
    -- Pricing
    currency_code CHAR(3),
    item_price_amount DECIMAL(10, 2),
    item_tax_amount DECIMAL(10, 2),
    shipping_price_amount DECIMAL(10, 2),
    shipping_tax_amount DECIMAL(10, 2),
    shipping_discount_amount DECIMAL(10, 2) DEFAULT 0,
    promotion_discount_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(order_item_id),
    INDEX idx_order_id (order_id),
    INDEX idx_asin (asin),
    INDEX idx_sku (sku),
    INDEX idx_seller_id (seller_id)
);

-- ============================================
-- FINANCIAL EVENTS (from SP-API Finances API)
-- ============================================

CREATE TABLE IF NOT EXISTS financial_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    
    -- Event identification
    event_type VARCHAR(50) NOT NULL, -- order_fee, refund, adjustment, storage_fee, etc.
    amazon_order_id VARCHAR(50),
    
    -- Product/SKU
    asin VARCHAR(10),
    sku VARCHAR(255),
    fnsku VARCHAR(10),
    
    -- Fee details
    fee_type VARCHAR(100), -- ReferralFee, FBAPerUnitFulfillmentFee, Commission, etc.
    fee_description TEXT,
    
    -- Amounts
    currency_code CHAR(3),
    amount DECIMAL(10, 2),
    
    -- Dates
    posted_date TIMESTAMP,
    
    -- Sync metadata
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_seller_id (seller_id),
    INDEX idx_amazon_order_id (amazon_order_id),
    INDEX idx_sku (sku),
    INDEX idx_event_type (event_type),
    INDEX idx_posted_date (posted_date)
);

-- ============================================
-- INVENTORY SNAPSHOTS (from SP-API Reports/Inventory)
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    marketplace_id VARCHAR(50) NOT NULL REFERENCES marketplaces(id),
    
    -- Inventory quantities
    quantity_available INTEGER DEFAULT 0, -- sellable
    quantity_inbound INTEGER DEFAULT 0, -- in transit to FBA
    quantity_reserved INTEGER DEFAULT 0, -- reserved for orders
    quantity_unfulfillable INTEGER DEFAULT 0, -- damaged/expired
    
    -- Snapshot date
    snapshot_date DATE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_product_id (product_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_snapshot_date (snapshot_date)
);

-- ============================================
-- SYNC JOBS (tracking background sync tasks)
-- ============================================

CREATE TABLE IF NOT EXISTS sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    
    -- Job details
    job_type VARCHAR(50) NOT NULL, -- orders, products, inventory, finances, full
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    
    -- Progress
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    
    -- Error tracking
    error_message TEXT,
    error_details JSONB,
    
    -- Timing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_seller_id (seller_id),
    INDEX idx_status (status),
    INDEX idx_job_type (job_type),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- API RATE LIMITS (tracking SP-API throttling)
-- ============================================

CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    
    -- Endpoint tracking
    endpoint VARCHAR(255) NOT NULL, -- e.g., "/orders/v0/orders"
    method VARCHAR(10) NOT NULL, -- GET, POST, etc.
    
    -- Rate limit info
    requests_made INTEGER DEFAULT 0,
    requests_allowed INTEGER,
    rate_limit_reset_at TIMESTAMP,
    
    -- Throttling
    is_throttled BOOLEAN DEFAULT false,
    throttled_until TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(seller_id, endpoint, method),
    INDEX idx_seller_endpoint (seller_id, endpoint)
);

-- ============================================
-- TRIGGERS for updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_metrics_updated_at BEFORE UPDATE ON product_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_events_updated_at BEFORE UPDATE ON financial_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sync_jobs_updated_at BEFORE UPDATE ON sync_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS for common queries
-- ============================================

-- Products with latest metrics
CREATE OR REPLACE VIEW products_with_metrics AS
SELECT 
    p.*,
    pm.selling_price,
    pm.profit_per_unit,
    pm.profit_margin_percent,
    pm.total_monthly_profit,
    pm.monthly_sales_velocity,
    pm.health_score,
    pm.profitability_risk_level,
    pm.breakeven_risk_level,
    pm.cashflow_risk_level,
    pm.competition_risk_level,
    pm.inventory_risk_level,
    pm.critical_risks_count,
    pm.last_calculated_at
FROM products p
LEFT JOIN product_metrics pm ON p.id = pm.product_id;

-- Seller dashboard summary
CREATE OR REPLACE VIEW seller_dashboard_summary AS
SELECT 
    s.id as seller_id,
    s.amazon_seller_id,
    s.seller_name,
    s.last_sync_at,
    s.last_sync_status,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_products,
    SUM(pm.total_monthly_profit) as total_monthly_profit,
    AVG(pm.health_score) as avg_health_score,
    COUNT(CASE WHEN pm.critical_risks_count > 0 THEN 1 END) as products_at_risk
FROM sellers s
LEFT JOIN products p ON s.id = p.seller_id
LEFT JOIN product_metrics pm ON p.id = pm.product_id
GROUP BY s.id, s.amazon_seller_id, s.seller_name, s.last_sync_at, s.last_sync_status;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE sellers IS 'Amazon sellers connected via SP-API OAuth';
COMMENT ON TABLE products IS 'Product catalog synced from SP-API';
COMMENT ON TABLE product_metrics IS 'Calculated metrics from B1-B7 logic applied to SP-API data';
COMMENT ON TABLE orders IS 'Order data from SP-API Orders API';
COMMENT ON TABLE order_items IS 'Individual items within orders';
COMMENT ON TABLE financial_events IS 'Fee and settlement data from SP-API Finances API';
COMMENT ON TABLE inventory_snapshots IS 'Daily inventory levels from SP-API';
COMMENT ON TABLE sync_jobs IS 'Background sync job tracking';
COMMENT ON TABLE api_rate_limits IS 'SP-API throttling and rate limit tracking';
