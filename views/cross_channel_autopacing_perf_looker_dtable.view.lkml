view: cross_channel_autopacing_perf_looker_dtable {
  # Exact, case-sensitive name of the dynamic table (quotes required).
  sql_table_name: DWH.DBO."Cross_Channel_Autopacing_Perf_Looker_dtable" ;;

  # ---------------------------------------------------------------- keys
  dimension: pk {
    primary_key: yes
    hidden: yes
    sql: ${TABLE}.report_date || '|' || ${TABLE}.platform || '|' || ${TABLE}.source_role || '|'
      || COALESCE(${TABLE}.account_id, '') || '|' || COALESCE(${TABLE}.campaign_id, ${TABLE}.campaign_name, '') ;;
  }

  # ---------------------------------------------------------------- time
  dimension_group: report {
    type: time
    timeframes: [date, week, month, quarter, year, day_of_week]
    convert_tz: no
    datatype: date
    sql: ${TABLE}.report_date ;;
  }

  # ---------------------------------------------------------------- media hierarchy
  dimension: platform {
    group_label: "Media"
    description: "Publisher, using Auto-Pacing labels (Google, Bing, Facebook, ...)."
    sql: ${TABLE}.platform ;;
  }
  dimension: channel {
    group_label: "Media"
    description: "Search / Social / Native / Retail Media / Programmatic."
    sql: ${TABLE}.channel ;;
  }
  dimension: campaign_type {
    group_label: "Media"
    description: "Campaign sub-type where the source exposes it (SA360 today)."
    sql: COALESCE(NULLIF(${TABLE}.campaign_type, ''), 'Not reported') ;;
  }
  dimension: client_id   { group_label: "Client" sql: ${TABLE}.client_id ;; }
  dimension: client_name { group_label: "Client" sql: ${TABLE}.client_name ;; }
  dimension: account_id  { group_label: "Account" sql: ${TABLE}.account_id ;; }
  dimension: account_name { group_label: "Account" sql: ${TABLE}.account_name ;; }
  dimension: campaign_id { group_label: "Campaign" sql: ${TABLE}.campaign_id ;; }
  dimension: campaign_name { group_label: "Campaign" sql: ${TABLE}.campaign_name ;; }

  # ---------------------------------------------------------------- data lineage
  dimension: source_role {
    group_label: "Data lineage"
    description: "publisher = native buying platform; search_manager = SA360."
    sql: ${TABLE}.source_role ;;
  }
  dimension: include_in_totals {
    group_label: "Data lineage"
    type: yesno
    description: "Yes = counts toward exec totals. SA360 rows duplicating a native account are No."
    sql: ${TABLE}.include_in_totals ;;
  }
  dimension: data_source {
    group_label: "Data lineage"
    description: "Native / SA360 only / SA360 (duplicate of native)."
    sql: ${TABLE}.data_source ;;
  }
  dimension: is_unmapped_client {
    group_label: "Data lineage"
    type: yesno
    sql: ${TABLE}.is_unmapped_client ;;
  }
  dimension: currency_code { group_label: "Data lineage" sql: ${TABLE}.currency_code ;; }
  dimension: fx_status {
    group_label: "Data lineage"
    description: "usd / assumed_usd / converted / missing_rate."
    sql: ${TABLE}.fx_status ;;
  }

  # ================================================================ MEASURES
  # ---------------------------------------------------------------- delivery
  measure: cost {
    label: "Spend"
    type: sum
    sql: ${TABLE}.cost_usd ;;
    value_format_name: usd_0
  }
  measure: impressions {
    type: sum
    sql: ${TABLE}.impressions ;;
    value_format_name: decimal_0
  }
  measure: clicks {
    type: sum
    sql: ${TABLE}.clicks ;;
    value_format_name: decimal_0
  }
  measure: cpc {
    label: "CPC"
    type: number
    sql: ${cost} / NULLIF(${clicks}, 0) ;;
    value_format_name: usd
  }
  measure: cpm {
    label: "CPM"
    type: number
    sql: 1000 * ${cost} / NULLIF(${impressions}, 0) ;;
    value_format_name: usd
  }
  measure: ctr {
    label: "CTR"
    type: number
    sql: ${clicks} / NULLIF(${impressions}, 0) ;;
    value_format_name: percent_2
  }

  # ---------------------------------------------------------------- search impression share
  measure: is_impressions          { hidden: yes type: sum sql: ${TABLE}.is_impressions ;; }
  measure: is_eligible_impressions { group_label: "Impression share" type: sum sql: ${TABLE}.is_eligible_impressions ;; value_format_name: decimal_0 }
  measure: is_lost_budget_impr     { hidden: yes type: sum sql: ${TABLE}.is_lost_budget_impressions ;; }
  measure: is_lost_rank_impr       { hidden: yes type: sum sql: ${TABLE}.is_lost_rank_impressions ;; }

  measure: search_impression_share {
    group_label: "Impression share"
    type: number
    sql: ${is_impressions} / NULLIF(${is_eligible_impressions}, 0) ;;
    value_format_name: percent_1
  }
  measure: search_lost_is_budget {
    group_label: "Impression share"
    label: "Search Lost IS (Budget)"
    type: number
    sql: ${is_lost_budget_impr} / NULLIF(${is_eligible_impressions}, 0) ;;
    value_format_name: percent_1
  }
  measure: search_lost_is_rank {
    group_label: "Impression share"
    label: "Search Lost IS (Rank)"
    type: number
    sql: ${is_lost_rank_impr} / NULLIF(${is_eligible_impressions}, 0) ;;
    value_format_name: percent_1
  }

  # ---------------------------------------------------------------- portfolio counts
  measure: clients_count   { group_label: "Portfolio" label: "Active Clients"   type: count_distinct sql: ${client_id} ;; }
  measure: accounts_count  { group_label: "Portfolio" label: "Active Accounts"  type: count_distinct sql: ${account_id} ;; }
  measure: platforms_count { group_label: "Portfolio" label: "Active Platforms" type: count_distinct sql: ${platform} ;; }
  measure: campaigns_count {
    group_label: "Portfolio"
    label: "Active Campaigns"
    type: count_distinct
    sql: ${platform} || '|' || COALESCE(${account_id}, '') || '|' || COALESCE(${campaign_id}, ${campaign_name}) ;;
  }

  # ---------------------------------------------------------------- data health (all rows)
  measure: row_count {
    group_label: "Data health"
    label: "Rows"
    type: count
  }
  measure: days_with_data {
    group_label: "Data health"
    type: count_distinct
    sql: ${TABLE}.report_date ;;
  }
  measure: first_data_date {
    group_label: "Data health"
    type: date
    sql: MIN(${TABLE}.report_date) ;;
    convert_tz: no
  }
  measure: last_data_date {
    group_label: "Data health"
    type: date
    sql: MAX(${TABLE}.report_date) ;;
    convert_tz: no
  }
  measure: days_since_last_data {
    group_label: "Data health"
    description: "Days between the latest date with data and today. 1 = complete through yesterday."
    type: number
    sql: DATEDIFF(day, MAX(${TABLE}.report_date), CURRENT_DATE) ;;
    value_format_name: decimal_0
  }
  measure: cost_all_sources {
    group_label: "Data health"
    label: "Spend (all sources, incl. duplicates)"
    type: sum
    sql: ${TABLE}.cost_usd ;;
    value_format_name: usd_0
  }
  measure: cost_sa360_duplicate {
    group_label: "Data health"
    label: "Spend excluded (SA360 duplicate)"
    type: sum
    sql: IFF(NOT ${TABLE}.include_in_totals, ${TABLE}.cost_usd, 0) ;;
    value_format_name: usd_0
  }
  measure: cost_sa360_only {
    group_label: "Data health"
    label: "Spend from SA360-only accounts"
    type: sum
    sql: IFF(${TABLE}.data_source = 'SA360 only', ${TABLE}.cost_usd, 0) ;;
    value_format_name: usd_0
  }
  measure: cost_unmapped_client {
    group_label: "Data health"
    label: "Spend with unmapped client"
    type: sum
    sql: IFF(${TABLE}.is_unmapped_client AND ${TABLE}.include_in_totals, ${TABLE}.cost_usd, 0) ;;
    value_format_name: usd_0
  }
  measure: cost_assumed_usd {
    group_label: "Data health"
    label: "Spend with unverified currency"
    type: sum
    sql: IFF(${TABLE}.fx_status IN ('assumed_usd', 'missing_rate') AND ${TABLE}.include_in_totals, ${TABLE}.cost_usd, 0) ;;
    value_format_name: usd_0
  }
}
