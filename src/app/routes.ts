export type RouteKey =
  | 'farmer_dashboard_1' | 'farmer_dashboard_2' | 'farm_activity_log_1' | 'farm_activity_log_2'
  | 'farm_performance_report_1' | 'farm_performance_report_2' | 'farm_settings_1' | 'farm_settings_2'
  | 'health_dashboard_1' | 'health_dashboard_2' | 'market_trends_dashboard_1' | 'market_trends_dashboard_2'
  | 'worker_performance_report' | 'add_new_batch_1' | 'add_new_batch_2' | 'bird_batches_1' | 'bird_batches_2'
  | 'egg_production_records_1' | 'egg_production_records_2' | 'equipment_maintenance_log_1' | 'equipment_maintenance_log_2'
  | 'feed_inventory_replenishment_1' | 'feed_inventory_replenishment_2' | 'inventory_management_1' | 'inventory_management_2'
  | 'spare_parts_tools_inventory_1' | 'spare_parts_tools_inventory_2' | 'feed_management_1' | 'feed_management_2'
  | 'feed_cost_analysis_1' | 'feed_cost_analysis_2' | 'supplier_directory_1' | 'supplier_directory_2'
  | 'biosecurity_checklist_1' | 'biosecurity_checklist_2' | 'log_health_record_1' | 'log_health_record_2'
  | 'mortality_analysis_1' | 'mortality_analysis_2' | 'treatment_history_report_1' | 'treatment_history_report_2'
  | 'vaccination_schedule_1' | 'vaccination_schedule_2' | 'vet_directory_1' | 'vet_directory_2'
  | 'buyer_offer_management_1' | 'buyer_offer_management_2' | 'list_produce_for_sale_1' | 'list_produce_for_sale_2'
  | 'market_connectivity_1' | 'market_connectivity_2' | 'predictive_revenue_forecast_1' | 'predictive_revenue_forecast_2'
  | 'sales_market_ledger_1' | 'sales_market_ledger_2' | 'worker_attendance_tracker_1' | 'worker_attendance_tracker_2'
  | 'worker_shift_scheduling' | 'sms_alert_configuration_1' | 'sms_alert_configuration_2';

export const routes: { key: RouteKey; label: string; group: string; kind: string }[] = [
  ['farmer_dashboard_1', 'Farmer Dashboard', 'Core', 'dashboard'],
  ['farm_activity_log_1', 'Farm Activity Log', 'Core', 'activity'],
  ['farm_performance_report_1', 'Performance Report', 'Core', 'report'],
  ['farm_settings_1', 'Farm Settings', 'Core', 'settings'],
  ['health_dashboard_1', 'Health Dashboard', 'Core', 'health'],
  ['market_trends_dashboard_1', 'Market Trends', 'Core', 'market'],
  ['worker_performance_report', 'Worker Performance', 'Core', 'workers'],
  ['add_new_batch_1', 'Add New Batch', 'Farm Records', 'batch-form'],
  ['bird_batches_1', 'Bird Batches', 'Farm Records', 'batches'],
  ['egg_production_records_1', 'Egg Production', 'Farm Records', 'eggs'],
  ['equipment_maintenance_log_1', 'Equipment Maintenance', 'Farm Records', 'maintenance'],
  ['feed_inventory_replenishment_1', 'Feed Replenishment', 'Farm Records', 'feed'],
  ['inventory_management_1', 'Inventory Management', 'Farm Records', 'inventory'],
  ['spare_parts_tools_inventory_1', 'Spare Parts & Tools', 'Farm Records', 'inventory'],
  ['feed_management_1', 'Feed Management', 'Feed and Suppliers', 'feed'],
  ['feed_cost_analysis_1', 'Feed Cost Analysis', 'Feed and Suppliers', 'report'],
  ['supplier_directory_1', 'Supplier Directory', 'Feed and Suppliers', 'suppliers'],
  ['biosecurity_checklist_1', 'Biosecurity Checklist', 'Health', 'checklist'],
  ['log_health_record_1', 'Log Health Record', 'Health', 'health-form'],
  ['mortality_analysis_1', 'Mortality Analysis', 'Health', 'mortality'],
  ['treatment_history_report_1', 'Treatment History', 'Health', 'treatments'],
  ['vaccination_schedule_1', 'Vaccination Schedule', 'Health', 'vaccination'],
  ['vet_directory_1', 'Vet Directory', 'Health', 'vets'],
  ['buyer_offer_management_1', 'Buyer Offers', 'Market and Sales', 'offers'],
  ['list_produce_for_sale_1', 'List Produce', 'Market and Sales', 'sale-form'],
  ['market_connectivity_1', 'Market Connectivity', 'Market and Sales', 'market'],
  ['predictive_revenue_forecast_1', 'Revenue Forecast', 'Market and Sales', 'forecast'],
  ['sales_market_ledger_1', 'Sales & Market Ledger', 'Market and Sales', 'sales'],
  ['worker_attendance_tracker_1', 'Worker Attendance', 'Workers and Alerts', 'workers'],
  ['worker_shift_scheduling', 'Shift Scheduling', 'Workers and Alerts', 'workers'],
  ['sms_alert_configuration_1', 'SMS Alerts', 'Workers and Alerts', 'sms']
].map(([key, label, group, kind]) => ({ key: key as RouteKey, label, group, kind }));

export function moduleForRoute(route: { label: string; group: string; kind: string }) {
  if (route.kind === 'dashboard' || route.kind === 'settings' || route.kind === 'activity' || route.kind === 'report') return 'core';
  if (route.group === 'Farm Records' || ['batches', 'batch-form', 'eggs', 'inventory', 'maintenance'].includes(route.kind)) return 'farm_records';
  if (route.group === 'Feed and Suppliers' || route.kind === 'feed' || route.kind === 'suppliers') return 'feed_suppliers';
  if (route.group === 'Health' || ['health', 'health-form', 'mortality', 'treatments', 'vaccination', 'vets', 'checklist'].includes(route.kind)) return 'health';
  if (route.group === 'Market and Sales' || ['sales', 'market', 'offers', 'forecast', 'sale-form'].includes(route.kind)) return 'market_sales';
  if (route.group === 'Workers and Alerts' || ['workers', 'sms'].includes(route.kind)) return 'workers_alerts';
  return 'core';
}
