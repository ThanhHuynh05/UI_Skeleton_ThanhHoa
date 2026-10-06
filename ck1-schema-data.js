window.CK1_SCHEMA = {
  "version": "CK1 v2.1",
  "database": "PostgreSQL 16",
  "schemaDate": "2026-10-01",
  "source": "ck1_schema_full_v2.sql (DA-025)",
  "tableCount": 111,
  "tables": [
    {
      "schema": "platform",
      "name": "audit_logs",
      "qualifiedName": "platform.audit_logs",
      "label": "Nhật ký truy cập / truy vấn",
      "domain": "Security & Governance",
      "cluster": 10,
      "description": "Nhật ký truy cập / truy vấn.",
      "grain": "1 sự kiện truy cập dữ liệu/câu hỏi NL gửi tới Agent.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "occurred_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "user_id",
          "type": "uuid"
        },
        {
          "name": "action",
          "type": "text"
        },
        {
          "name": "table_schema",
          "type": "text"
        },
        {
          "name": "table_name",
          "type": "text"
        },
        {
          "name": "record_id",
          "type": "uuid"
        },
        {
          "name": "nl_question",
          "type": "text"
        },
        {
          "name": "generated_sql",
          "type": "text"
        },
        {
          "name": "policy_decision",
          "type": "text"
        },
        {
          "name": "details",
          "type": "jsonb"
        }
      ]
    },
    {
      "schema": "platform",
      "name": "data_access_policies",
      "qualifiedName": "platform.data_access_policies",
      "label": "Chính sách truy cập dữ liệu",
      "domain": "Security & Governance",
      "cluster": 10,
      "description": "Chính sách truy cập dữ liệu.",
      "grain": "1 chính sách allow/mask/deny cho 1 role trên 1 bảng/cột.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "role_id",
          "type": "uuid"
        },
        {
          "name": "domain",
          "type": "text"
        },
        {
          "name": "table_schema",
          "type": "text"
        },
        {
          "name": "table_name",
          "type": "text"
        },
        {
          "name": "column_name",
          "type": "text"
        },
        {
          "name": "access_level",
          "type": "text"
        },
        {
          "name": "masking_rule",
          "type": "text"
        },
        {
          "name": "row_filter",
          "type": "text"
        },
        {
          "name": "priority",
          "type": "integer"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "platform",
      "name": "departments",
      "qualifiedName": "platform.departments",
      "label": "Phòng ban",
      "domain": "Security & Governance",
      "cluster": 10,
      "description": "Phòng ban.",
      "grain": "1 phòng ban.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "department_code",
          "type": "text"
        },
        {
          "name": "department_name",
          "type": "text"
        },
        {
          "name": "parent_department_id",
          "type": "uuid"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "platform",
      "name": "roles",
      "qualifiedName": "platform.roles",
      "label": "Vai trò phân quyền",
      "domain": "Security & Governance",
      "cluster": 10,
      "description": "Vai trò phân quyền.",
      "grain": "1 vai trò phân quyền (RBAC).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "role_code",
          "type": "text"
        },
        {
          "name": "role_name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "is_system",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "platform",
      "name": "system_users",
      "qualifiedName": "platform.system_users",
      "label": "Tài khoản hệ thống",
      "domain": "Security & Governance",
      "cluster": 10,
      "description": "Tài khoản hệ thống.",
      "grain": "1 tài khoản đăng nhập (người hoặc service account như NL Query Agent).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "employee_id",
          "type": "uuid"
        },
        {
          "name": "username",
          "type": "text"
        },
        {
          "name": "email",
          "type": "text"
        },
        {
          "name": "user_type",
          "type": "text"
        },
        {
          "name": "auth_provider",
          "type": "text"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "last_login_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "platform",
      "name": "user_role_assignments",
      "qualifiedName": "platform.user_role_assignments",
      "label": "Gán vai trò cho tài khoản",
      "domain": "Security & Governance",
      "cluster": 10,
      "description": "Gán vai trò cho tài khoản.",
      "grain": "1 lần gán 1 role cho 1 user (có thể giới hạn theo dự án).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "user_id",
          "type": "uuid"
        },
        {
          "name": "role_id",
          "type": "uuid"
        },
        {
          "name": "scope_project_id",
          "type": "uuid"
        },
        {
          "name": "valid_from",
          "type": "date"
        },
        {
          "name": "valid_to",
          "type": "date"
        },
        {
          "name": "assigned_by_user_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "amenity_bookings",
      "qualifiedName": "public.amenity_bookings",
      "label": "Đặt tiện ích",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Đặt tiện ích.",
      "grain": "1 lượt đặt tiện ích của khách thuê.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "tenant_id",
          "type": "uuid"
        },
        {
          "name": "amenity_name",
          "type": "text"
        },
        {
          "name": "booking_date",
          "type": "date"
        },
        {
          "name": "time_slot",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "appointment_bookings",
      "qualifiedName": "public.appointment_bookings",
      "label": "Lịch hẹn",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Lịch hẹn.",
      "grain": "1 lịch hẹn với khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "opportunity_id",
          "type": "uuid"
        },
        {
          "name": "subject",
          "type": "text"
        },
        {
          "name": "location",
          "type": "text"
        },
        {
          "name": "start_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "end_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "assigned_agent_id",
          "type": "uuid"
        },
        {
          "name": "outcome",
          "type": "text"
        },
        {
          "name": "outcome_notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "bank_accounts",
      "qualifiedName": "public.bank_accounts",
      "label": "Tài khoản ngân hàng",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Tài khoản ngân hàng.",
      "grain": "1 tài khoản ngân hàng của công ty.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "account_name",
          "type": "text"
        },
        {
          "name": "bank_name",
          "type": "text"
        },
        {
          "name": "account_number_masked",
          "type": "text"
        },
        {
          "name": "account_number_encrypted",
          "type": "text"
        },
        {
          "name": "currency",
          "type": "text"
        },
        {
          "name": "current_balance",
          "type": "numeric(18,2)"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "bank_transactions",
      "qualifiedName": "public.bank_transactions",
      "label": "Giao dịch ngân hàng",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Giao dịch ngân hàng.",
      "grain": "1 dòng giao dịch ngân hàng (chuyển khoản nội bộ = 2 dòng cùng transfer_group_id, DA-019).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "bank_account_id",
          "type": "uuid"
        },
        {
          "name": "voucher_id",
          "type": "uuid"
        },
        {
          "name": "transaction_date",
          "type": "timestamp with time zone"
        },
        {
          "name": "amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "transaction_type",
          "type": "text"
        },
        {
          "name": "reference_note",
          "type": "text"
        },
        {
          "name": "reconciled",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "transfer_group_id",
          "type": "uuid"
        }
      ]
    },
    {
      "schema": "public",
      "name": "broker_commissions",
      "qualifiedName": "public.broker_commissions",
      "label": "Hoa hồng môi giới",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Hoa hồng môi giới.",
      "grain": "1 khoản hoa hồng môi giới trên 1 hợp đồng.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "broker_id",
          "type": "uuid"
        },
        {
          "name": "commission_rate",
          "type": "numeric(5,2)"
        },
        {
          "name": "commission_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "paid_date",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "budgets",
      "qualifiedName": "public.budgets",
      "label": "Ngân sách",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Ngân sách.",
      "grain": "1 ngân sách của 1 trung tâm chi phí trong 1 kỳ.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "cost_center_id",
          "type": "uuid"
        },
        {
          "name": "fiscal_year",
          "type": "integer"
        },
        {
          "name": "fiscal_period",
          "type": "text"
        },
        {
          "name": "budgeted_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "actual_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "buildings",
      "qualifiedName": "public.buildings",
      "label": "Tòa nhà",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Tòa nhà.",
      "grain": "1 toà nhà thuộc 1 dự án.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "building_name",
          "type": "text"
        },
        {
          "name": "address",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "num_stories",
          "type": "integer"
        },
        {
          "name": "total_floor_area_sqm",
          "type": "numeric(14,2)"
        },
        {
          "name": "rentable_area_sqm",
          "type": "numeric(14,2)"
        },
        {
          "name": "typical_floor_size_sqm",
          "type": "numeric(14,2)"
        },
        {
          "name": "total_units",
          "type": "integer"
        },
        {
          "name": "year_built",
          "type": "integer"
        },
        {
          "name": "year_last_renovated",
          "type": "integer"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "campaign_budgets",
      "qualifiedName": "public.campaign_budgets",
      "label": "Ngân sách chiến dịch",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Ngân sách chiến dịch.",
      "grain": "1 đợt ngân sách của 1 chiến dịch/kênh.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "campaign_id",
          "type": "uuid"
        },
        {
          "name": "channel_id",
          "type": "uuid"
        },
        {
          "name": "budgeted_cost",
          "type": "numeric(18,2)"
        },
        {
          "name": "actual_cost",
          "type": "numeric(18,2)"
        },
        {
          "name": "currency_code",
          "type": "text"
        },
        {
          "name": "period_start",
          "type": "date"
        },
        {
          "name": "period_end",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "campaign_channels",
      "qualifiedName": "public.campaign_channels",
      "label": "Kênh truyền thông",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Kênh truyền thông.",
      "grain": "1 kênh triển khai của 1 chiến dịch.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "campaign_id",
          "type": "uuid"
        },
        {
          "name": "channel_name",
          "type": "text"
        },
        {
          "name": "channel_type",
          "type": "text"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "campaign_leads",
      "qualifiedName": "public.campaign_leads",
      "label": "Lead từ chiến dịch",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Lead từ chiến dịch.",
      "grain": "1 lead thuộc 1 chiến dịch (membership, không phải attribution).",
      "columns": [
        {
          "name": "campaign_id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "added_method",
          "type": "text"
        },
        {
          "name": "added_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "cancellations_refunds",
      "qualifiedName": "public.cancellations_refunds",
      "label": "Hủy HĐ & hoàn tiền",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Hủy HĐ & hoàn tiền.",
      "grain": "1 yêu cầu huỷ hợp đồng/hoàn tiền.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "cancellation_date",
          "type": "date"
        },
        {
          "name": "reason",
          "type": "text"
        },
        {
          "name": "refund_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "penalty_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "processed_date",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "chart_of_accounts",
      "qualifiedName": "public.chart_of_accounts",
      "label": "Hệ thống tài khoản",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Hệ thống tài khoản.",
      "grain": "1 tài khoản kế toán (hệ thống tài khoản).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "account_code",
          "type": "text"
        },
        {
          "name": "account_name",
          "type": "text"
        },
        {
          "name": "account_type",
          "type": "text"
        },
        {
          "name": "parent_account_id",
          "type": "uuid"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "chat_messages",
      "qualifiedName": "public.chat_messages",
      "label": "Tin nhắn chat",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Tin nhắn chat.",
      "grain": "1 tin nhắn trong 1 phiên chat.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "chat_session_id",
          "type": "uuid"
        },
        {
          "name": "direction",
          "type": "text"
        },
        {
          "name": "sender_type",
          "type": "text"
        },
        {
          "name": "body_text",
          "type": "text"
        },
        {
          "name": "sent_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "chat_sessions",
      "qualifiedName": "public.chat_sessions",
      "label": "Phiên chat",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Phiên chat.",
      "grain": "1 phiên chat với khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "channel",
          "type": "text"
        },
        {
          "name": "assigned_agent_id",
          "type": "uuid"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "started_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "closed_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "complaints",
      "qualifiedName": "public.complaints",
      "label": "Khiếu nại",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Khiếu nại.",
      "grain": "1 khiếu nại (có mức độ nghiêm trọng).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "ticket_id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "severity",
          "type": "text"
        },
        {
          "name": "complaint_type",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "is_escalated_to_management",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "construction_progress",
      "qualifiedName": "public.construction_progress",
      "label": "Tiến độ thi công",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Tiến độ thi công.",
      "grain": "1 báo cáo tiến độ thi công.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "phase_id",
          "type": "uuid"
        },
        {
          "name": "report_date",
          "type": "date"
        },
        {
          "name": "progress_percentage",
          "type": "numeric(5,2)"
        },
        {
          "name": "milestone",
          "type": "text"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "reported_by_user_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "contacts",
      "qualifiedName": "public.contacts",
      "label": "Người liên hệ",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Người liên hệ.",
      "grain": "1 người liên hệ của 1 khách cá nhân hoặc 1 doanh nghiệp.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "corporate_account_id",
          "type": "uuid"
        },
        {
          "name": "full_name",
          "type": "text"
        },
        {
          "name": "role",
          "type": "text"
        },
        {
          "name": "email",
          "type": "text"
        },
        {
          "name": "phone",
          "type": "text"
        },
        {
          "name": "is_primary",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "contract_amendments",
      "qualifiedName": "public.contract_amendments",
      "label": "Phụ lục hợp đồng",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Phụ lục hợp đồng.",
      "grain": "1 phụ lục/điều chỉnh hợp đồng.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "amendment_type",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "old_value",
          "type": "text"
        },
        {
          "name": "new_value",
          "type": "text"
        },
        {
          "name": "effective_date",
          "type": "date"
        },
        {
          "name": "approved_by_user_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "contract_documents",
      "qualifiedName": "public.contract_documents",
      "label": "Hồ sơ hợp đồng",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Hồ sơ hợp đồng.",
      "grain": "1 file đính kèm hợp đồng.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "document_type",
          "type": "text"
        },
        {
          "name": "file_url",
          "type": "text"
        },
        {
          "name": "uploaded_by_user_id",
          "type": "uuid"
        },
        {
          "name": "uploaded_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "contract_parties",
      "qualifiedName": "public.contract_parties",
      "label": "Các bên hợp đồng",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Các bên hợp đồng.",
      "grain": "1 bên tham gia ký 1 hợp đồng.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "party_role",
          "type": "text"
        },
        {
          "name": "full_name",
          "type": "text"
        },
        {
          "name": "id_number",
          "type": "text"
        },
        {
          "name": "is_foreign",
          "type": "boolean"
        },
        {
          "name": "phone",
          "type": "text"
        },
        {
          "name": "email",
          "type": "text"
        },
        {
          "name": "signature_date",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "corporate_accounts",
      "qualifiedName": "public.corporate_accounts",
      "label": "Tài khoản doanh nghiệp",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Tài khoản doanh nghiệp.",
      "grain": "1 doanh nghiệp/quỹ đầu tư gắn với 1 customer loại corporate.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "company_name",
          "type": "text"
        },
        {
          "name": "business_registration_no",
          "type": "text"
        },
        {
          "name": "industry_level_1",
          "type": "text"
        },
        {
          "name": "industry_level_2",
          "type": "text"
        },
        {
          "name": "industry_level_3",
          "type": "text"
        },
        {
          "name": "industry_level_4",
          "type": "text"
        },
        {
          "name": "industry_code",
          "type": "text"
        },
        {
          "name": "no_of_employees",
          "type": "text"
        },
        {
          "name": "company_type",
          "type": "text"
        },
        {
          "name": "legal_representative_name",
          "type": "text"
        },
        {
          "name": "legal_representative_title",
          "type": "text"
        },
        {
          "name": "website",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "cost_centers",
      "qualifiedName": "public.cost_centers",
      "label": "Trung tâm chi phí",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Trung tâm chi phí.",
      "grain": "1 trung tâm chi phí.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "cost_center_code",
          "type": "text"
        },
        {
          "name": "cost_center_name",
          "type": "text"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "department",
          "type": "text"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "credit_ratings",
      "qualifiedName": "public.credit_ratings",
      "label": "Xếp hạng tín dụng",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Xếp hạng tín dụng.",
      "grain": "1 lần đánh giá tín dụng/khả năng vay của 1 khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "credit_score",
          "type": "integer"
        },
        {
          "name": "rating_band",
          "type": "text"
        },
        {
          "name": "max_loan_amount_estimate",
          "type": "numeric(18,2)"
        },
        {
          "name": "loan_to_value_ratio",
          "type": "numeric(5,2)"
        },
        {
          "name": "bank_partner",
          "type": "text"
        },
        {
          "name": "assessed_at",
          "type": "date"
        },
        {
          "name": "valid_until",
          "type": "date"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "customer_feedback",
      "qualifiedName": "public.customer_feedback",
      "label": "Đánh giá dịch vụ",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Đánh giá dịch vụ.",
      "grain": "1 phản hồi CSAT của khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "ticket_id",
          "type": "uuid"
        },
        {
          "name": "csat_score",
          "type": "integer"
        },
        {
          "name": "comment",
          "type": "text"
        },
        {
          "name": "channel",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "customer_preferences",
      "qualifiedName": "public.customer_preferences",
      "label": "Nhu cầu tìm kiếm",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Nhu cầu tìm kiếm.",
      "grain": "1 bộ nhu cầu BĐS (hướng, phòng ngủ, ngân sách, khu vực) của 1 khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "preferred_direction",
          "type": "text"
        },
        {
          "name": "min_bedrooms",
          "type": "integer"
        },
        {
          "name": "max_bedrooms",
          "type": "integer"
        },
        {
          "name": "min_budget",
          "type": "numeric(18,2)"
        },
        {
          "name": "max_budget",
          "type": "numeric(18,2)"
        },
        {
          "name": "preferred_city",
          "type": "text"
        },
        {
          "name": "preferred_district",
          "type": "text"
        },
        {
          "name": "preferred_project_type",
          "type": "text"
        },
        {
          "name": "move_in_timeframe",
          "type": "text"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "customer_profiles",
      "qualifiedName": "public.customer_profiles",
      "label": "Hồ sơ chi tiết khách hàng",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Hồ sơ chi tiết khách hàng.",
      "grain": "1 hồ sơ nhân khẩu học/thu nhập của 1 khách (quan hệ 1-1 với customers).",
      "columns": [
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "occupation",
          "type": "text"
        },
        {
          "name": "employer_name",
          "type": "text"
        },
        {
          "name": "monthly_income",
          "type": "numeric(18,2)"
        },
        {
          "name": "income_source",
          "type": "text"
        },
        {
          "name": "marital_status",
          "type": "text"
        },
        {
          "name": "education_level",
          "type": "text"
        },
        {
          "name": "address_line",
          "type": "text"
        },
        {
          "name": "ward",
          "type": "text"
        },
        {
          "name": "district",
          "type": "text"
        },
        {
          "name": "city",
          "type": "text"
        },
        {
          "name": "permanent_address",
          "type": "text"
        },
        {
          "name": "current_address_same_as_permanent",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "customer_requirements",
      "qualifiedName": "public.customer_requirements",
      "label": "Yêu cầu sản phẩm của khách",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Yêu cầu sản phẩm của khách.",
      "grain": "1 yêu cầu tìm BĐS (form) của 1 lead/contact.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "contact_id",
          "type": "uuid"
        },
        {
          "name": "property_id",
          "type": "uuid"
        },
        {
          "name": "requirement_type",
          "type": "text"
        },
        {
          "name": "budget_min",
          "type": "numeric(18,2)"
        },
        {
          "name": "budget_max",
          "type": "numeric(18,2)"
        },
        {
          "name": "bedrooms_min",
          "type": "integer"
        },
        {
          "name": "bathrooms_min",
          "type": "integer"
        },
        {
          "name": "preferred_area",
          "type": "text"
        },
        {
          "name": "property_type",
          "type": "text"
        },
        {
          "name": "raw_form_payload",
          "type": "jsonb"
        },
        {
          "name": "submitted_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "customer_segments",
      "qualifiedName": "public.customer_segments",
      "label": "Phân khúc khách hàng",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Phân khúc khách hàng.",
      "grain": "1 lần gán 1 khách vào 1 phân khúc.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "segment_name",
          "type": "text"
        },
        {
          "name": "segment_source",
          "type": "text"
        },
        {
          "name": "assigned_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "valid_until",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "customer_tags",
      "qualifiedName": "public.customer_tags",
      "label": "Nhãn khách hàng",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Nhãn khách hàng.",
      "grain": "1 nhãn gắn cho 1 khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "tag",
          "type": "text"
        },
        {
          "name": "tag_source",
          "type": "text"
        },
        {
          "name": "added_by_email",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "customers",
      "qualifiedName": "public.customers",
      "label": "Khách hàng",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Khách hàng.",
      "grain": "1 khách hàng (cá nhân hoặc vỏ doanh nghiệp) — bảng gốc định danh khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_type",
          "type": "text"
        },
        {
          "name": "salutation",
          "type": "text"
        },
        {
          "name": "first_name",
          "type": "text"
        },
        {
          "name": "middle_name",
          "type": "text"
        },
        {
          "name": "last_name",
          "type": "text"
        },
        {
          "name": "suffix",
          "type": "text"
        },
        {
          "name": "email",
          "type": "text"
        },
        {
          "name": "phone",
          "type": "text"
        },
        {
          "name": "mobile",
          "type": "text"
        },
        {
          "name": "national_id_masked",
          "type": "text"
        },
        {
          "name": "date_of_birth",
          "type": "date"
        },
        {
          "name": "gender",
          "type": "text"
        },
        {
          "name": "nationality",
          "type": "text"
        },
        {
          "name": "customer_status",
          "type": "text"
        },
        {
          "name": "account_tier",
          "type": "text"
        },
        {
          "name": "source_lead_id",
          "type": "uuid"
        },
        {
          "name": "legacy_sf_id",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "full_name",
          "type": "text"
        }
      ]
    },
    {
      "schema": "public",
      "name": "deposits_bookings",
      "qualifiedName": "public.deposits_bookings",
      "label": "Đặt cọc / giữ chỗ",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Đặt cọc / giữ chỗ.",
      "grain": "1 khoản giữ chỗ/đặt cọc 1 căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "booking_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "booking_date",
          "type": "date"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "converted_contract_id",
          "type": "uuid"
        },
        {
          "name": "expiry_date",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "discount_applications",
      "qualifiedName": "public.discount_applications",
      "label": "Áp dụng chiết khấu",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Áp dụng chiết khấu.",
      "grain": "1 lần áp 1 chính sách chiết khấu vào 1 dòng báo giá và/hoặc 1 hợp đồng (DA-009).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "discount_id",
          "type": "uuid"
        },
        {
          "name": "quotation_item_id",
          "type": "uuid"
        },
        {
          "name": "sales_contract_id",
          "type": "uuid"
        },
        {
          "name": "applied_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "applied_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "approved_by_user_id",
          "type": "uuid"
        },
        {
          "name": "notes",
          "type": "text"
        }
      ]
    },
    {
      "schema": "public",
      "name": "discounts",
      "qualifiedName": "public.discounts",
      "label": "Chính sách chiết khấu",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Chính sách chiết khấu.",
      "grain": "1 chính sách chiết khấu (danh mục).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "discount_type",
          "type": "text"
        },
        {
          "name": "discount_value",
          "type": "numeric(18,2)"
        },
        {
          "name": "applies_to",
          "type": "text"
        },
        {
          "name": "valid_from",
          "type": "timestamp with time zone"
        },
        {
          "name": "valid_to",
          "type": "timestamp with time zone"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "email_marketing_logs",
      "qualifiedName": "public.email_marketing_logs",
      "label": "Nhật ký email marketing",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Nhật ký email marketing.",
      "grain": "1 email gửi tới 1 người nhận.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "campaign_id",
          "type": "uuid"
        },
        {
          "name": "landing_page_id",
          "type": "uuid"
        },
        {
          "name": "recipient_customer_id",
          "type": "uuid"
        },
        {
          "name": "recipient_email",
          "type": "text"
        },
        {
          "name": "subject",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "bounce_type",
          "type": "text"
        },
        {
          "name": "opened_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "clicked_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "sent_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "delivered_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "bounced_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "unsubscribed_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "employees",
      "qualifiedName": "public.employees",
      "label": "Nhân viên",
      "domain": "Cross-domain Reference",
      "cluster": 9,
      "description": "Nhân viên.",
      "grain": "1 nhân viên nội bộ — hub cho mọi cột *_user_id/*_agent_id.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "employee_code",
          "type": "text"
        },
        {
          "name": "full_name",
          "type": "text"
        },
        {
          "name": "role",
          "type": "text"
        },
        {
          "name": "phone",
          "type": "text"
        },
        {
          "name": "email",
          "type": "text"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "department_id",
          "type": "uuid"
        }
      ]
    },
    {
      "schema": "public",
      "name": "event_registrations",
      "qualifiedName": "public.event_registrations",
      "label": "Đăng ký tham dự sự kiện",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Đăng ký tham dự sự kiện.",
      "grain": "1 lượt đăng ký tham dự 1 sự kiện.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "event_id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "attendee_name",
          "type": "text"
        },
        {
          "name": "attendee_phone",
          "type": "text"
        },
        {
          "name": "attendee_email",
          "type": "text"
        },
        {
          "name": "registered_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "expense_claims",
      "qualifiedName": "public.expense_claims",
      "label": "Đề nghị thanh toán",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Đề nghị thanh toán.",
      "grain": "1 đề nghị thanh toán chi phí của nhân viên.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "employee_user_id",
          "type": "uuid"
        },
        {
          "name": "cost_center_id",
          "type": "uuid"
        },
        {
          "name": "claim_date",
          "type": "date"
        },
        {
          "name": "amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "category",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "approved_by_user_id",
          "type": "uuid"
        },
        {
          "name": "voucher_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "facility_assets",
      "qualifiedName": "public.facility_assets",
      "label": "Thiết bị tòa nhà",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Thiết bị tòa nhà.",
      "grain": "1 tài sản/thiết bị chung của toà nhà.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "building_id",
          "type": "uuid"
        },
        {
          "name": "asset_name",
          "type": "text"
        },
        {
          "name": "asset_type",
          "type": "text"
        },
        {
          "name": "install_date",
          "type": "date"
        },
        {
          "name": "warranty_expiry",
          "type": "date"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "fixed_assets",
      "qualifiedName": "public.fixed_assets",
      "label": "Tài sản cố định",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Tài sản cố định.",
      "grain": "1 tài sản cố định.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "asset_code",
          "type": "text"
        },
        {
          "name": "asset_name",
          "type": "text"
        },
        {
          "name": "cost_center_id",
          "type": "uuid"
        },
        {
          "name": "purchase_date",
          "type": "date"
        },
        {
          "name": "original_value",
          "type": "numeric(18,2)"
        },
        {
          "name": "depreciation_method",
          "type": "text"
        },
        {
          "name": "useful_life_years",
          "type": "integer"
        },
        {
          "name": "accumulated_depreciation",
          "type": "numeric(18,2)"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "floors",
      "qualifiedName": "public.floors",
      "label": "Tầng",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Tầng.",
      "grain": "1 tầng của 1 toà nhà.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "building_id",
          "type": "uuid"
        },
        {
          "name": "floor_number",
          "type": "integer"
        },
        {
          "name": "floor_name",
          "type": "text"
        },
        {
          "name": "total_units_on_floor",
          "type": "integer"
        },
        {
          "name": "floor_plan_url",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "handover_checklists",
      "qualifiedName": "public.handover_checklists",
      "label": "Bàn giao căn",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Bàn giao căn.",
      "grain": "1 hạng mục kiểm tra khi bàn giao căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "item_name",
          "type": "text"
        },
        {
          "name": "is_completed",
          "type": "boolean"
        },
        {
          "name": "checked_by_user_id",
          "type": "uuid"
        },
        {
          "name": "checked_date",
          "type": "date"
        },
        {
          "name": "notes",
          "type": "text"
        }
      ]
    },
    {
      "schema": "public",
      "name": "household_members",
      "qualifiedName": "public.household_members",
      "label": "Thành viên hộ gia đình",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Thành viên hộ gia đình.",
      "grain": "1 thành viên của 1 hộ gia đình — membership chuẩn (DA-015).",
      "columns": [
        {
          "name": "household_id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "relationship_role",
          "type": "text"
        },
        {
          "name": "related_to_customer_id",
          "type": "uuid"
        },
        {
          "name": "is_guarantor",
          "type": "boolean"
        },
        {
          "name": "is_primary_contact",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "households",
      "qualifiedName": "public.households",
      "label": "Hộ gia đình (bảng bổ sung)",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Hộ gia đình (bảng bổ sung).",
      "grain": "1 hộ gia đình (vỏ nhóm).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "household_name",
          "type": "text"
        },
        {
          "name": "primary_customer_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "inspection_logs",
      "qualifiedName": "public.inspection_logs",
      "label": "Nhật ký kiểm tra",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Nhật ký kiểm tra.",
      "grain": "1 lần kiểm tra thiết bị/căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "facility_asset_id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "inspection_type",
          "type": "text"
        },
        {
          "name": "inspector_user_id",
          "type": "uuid"
        },
        {
          "name": "inspection_date",
          "type": "date"
        },
        {
          "name": "result",
          "type": "text"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "investor_profiles",
      "qualifiedName": "public.investor_profiles",
      "label": "Hồ sơ nhà đầu tư",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Hồ sơ nhà đầu tư.",
      "grain": "1 hồ sơ khẩu vị đầu tư của 1 khách (1-1 với customers).",
      "columns": [
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "investor_type",
          "type": "text"
        },
        {
          "name": "risk_tolerance",
          "type": "text"
        },
        {
          "name": "typical_ticket_size",
          "type": "numeric(18,2)"
        },
        {
          "name": "funding_source",
          "type": "text"
        },
        {
          "name": "portfolio_count",
          "type": "integer"
        },
        {
          "name": "preferred_hold_period_months",
          "type": "integer"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "invoice_items",
      "qualifiedName": "public.invoice_items",
      "label": "Dòng hóa đơn",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Dòng hóa đơn.",
      "grain": "1 dòng hàng hoá/dịch vụ trên 1 hoá đơn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "invoice_id",
          "type": "uuid"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "quantity",
          "type": "numeric(10,2)"
        },
        {
          "name": "unit_price",
          "type": "numeric(18,2)"
        },
        {
          "name": "discount_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "vat_rate",
          "type": "numeric(5,2)"
        },
        {
          "name": "account_id",
          "type": "uuid"
        },
        {
          "name": "vat_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "line_total",
          "type": "numeric(18,2)"
        }
      ]
    },
    {
      "schema": "public",
      "name": "invoices",
      "qualifiedName": "public.invoices",
      "label": "Hóa đơn",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Hóa đơn.",
      "grain": "1 hoá đơn — source of truth số tiền/trạng thái phải thu (DA-013).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "invoice_number",
          "type": "text"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "invoice_date",
          "type": "date"
        },
        {
          "name": "due_date",
          "type": "date"
        },
        {
          "name": "total_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "journal_entries",
      "qualifiedName": "public.journal_entries",
      "label": "Bút toán",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Bút toán.",
      "grain": "1 bút toán (1 vế Nợ hoặc Có) thuộc 1 voucher.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "voucher_id",
          "type": "uuid"
        },
        {
          "name": "account_id",
          "type": "uuid"
        },
        {
          "name": "entry_date",
          "type": "date"
        },
        {
          "name": "debit_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "credit_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "reference_type",
          "type": "text"
        },
        {
          "name": "reference_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "kyc_documents",
      "qualifiedName": "public.kyc_documents",
      "label": "Giấy tờ định danh (KYC)",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Giấy tờ định danh (KYC).",
      "grain": "1 giấy tờ định danh (CCCD/hộ chiếu/GPKD) của 1 khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "document_type",
          "type": "text"
        },
        {
          "name": "document_number",
          "type": "text"
        },
        {
          "name": "issued_date",
          "type": "date"
        },
        {
          "name": "issued_place",
          "type": "text"
        },
        {
          "name": "expiry_date",
          "type": "date"
        },
        {
          "name": "front_image_path",
          "type": "text"
        },
        {
          "name": "back_image_path",
          "type": "text"
        },
        {
          "name": "verification_status",
          "type": "text"
        },
        {
          "name": "verified_by_email",
          "type": "text"
        },
        {
          "name": "verified_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "landing_pages",
      "qualifiedName": "public.landing_pages",
      "label": "Trang landing page",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Trang landing page.",
      "grain": "1 landing page của chiến dịch.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "campaign_id",
          "type": "uuid"
        },
        {
          "name": "page_name",
          "type": "text"
        },
        {
          "name": "url",
          "type": "text"
        },
        {
          "name": "utm_source",
          "type": "text"
        },
        {
          "name": "utm_medium",
          "type": "text"
        },
        {
          "name": "utm_campaign",
          "type": "text"
        },
        {
          "name": "view_count",
          "type": "integer"
        },
        {
          "name": "lead_count",
          "type": "integer"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "lead_assignments",
      "qualifiedName": "public.lead_assignments",
      "label": "Phân công lead",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Phân công lead.",
      "grain": "1 lần phân công 1 lead cho 1 nhân viên (lịch sử).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "assigned_to_agent_id",
          "type": "uuid"
        },
        {
          "name": "assigned_by_user_id",
          "type": "uuid"
        },
        {
          "name": "assignment_reason",
          "type": "text"
        },
        {
          "name": "assigned_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "unassigned_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "lead_attributions",
      "qualifiedName": "public.lead_attributions",
      "label": "Cụm 4",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Cụm 4 — Ghi công chiến dịch cho lead (DA-021). Rule: first_touch/last_touch = 1 dòng/lead với revenue_share=100; linear = N dòng/lead, tổng revenue_share = 100.",
      "grain": "See CK1 data dictionary.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "campaign_id",
          "type": "uuid"
        },
        {
          "name": "channel_id",
          "type": "uuid"
        },
        {
          "name": "attribution_type",
          "type": "text"
        },
        {
          "name": "revenue_share",
          "type": "numeric(5,2)"
        },
        {
          "name": "attributed_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "lead_sources",
      "qualifiedName": "public.lead_sources",
      "label": "Nguồn lead",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Nguồn lead.",
      "grain": "1 nguồn lead chuẩn hoá (danh mục).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "channel_group",
          "type": "text"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "sort_order",
          "type": "integer"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "lead_status_history",
      "qualifiedName": "public.lead_status_history",
      "label": "Lịch sử trạng thái lead",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Lịch sử trạng thái lead.",
      "grain": "1 lần đổi trạng thái của 1 lead.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "old_status",
          "type": "text"
        },
        {
          "name": "new_status",
          "type": "text"
        },
        {
          "name": "changed_by_user_id",
          "type": "uuid"
        },
        {
          "name": "changed_by_email",
          "type": "text"
        },
        {
          "name": "note",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "leads",
      "qualifiedName": "public.leads",
      "label": "Lead / Khách tiềm năng",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Lead / Khách tiềm năng.",
      "grain": "1 khách tiềm năng phát sinh từ 1 nguồn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "contact_id",
          "type": "uuid"
        },
        {
          "name": "created_by_user_id",
          "type": "uuid"
        },
        {
          "name": "handler_agent_id",
          "type": "uuid"
        },
        {
          "name": "lead_type",
          "type": "text"
        },
        {
          "name": "lead_source",
          "type": "text"
        },
        {
          "name": "lead_source_link",
          "type": "text"
        },
        {
          "name": "lead_channel",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "priority",
          "type": "text"
        },
        {
          "name": "lost_reasons",
          "type": "text"
        },
        {
          "name": "message",
          "type": "text"
        },
        {
          "name": "private_note",
          "type": "text"
        },
        {
          "name": "from_email",
          "type": "text"
        },
        {
          "name": "from_phone",
          "type": "text"
        },
        {
          "name": "source_permalink",
          "type": "text"
        },
        {
          "name": "is_converted",
          "type": "boolean"
        },
        {
          "name": "converted_opportunity_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "lead_source_id",
          "type": "uuid"
        }
      ]
    },
    {
      "schema": "public",
      "name": "lease_contracts",
      "qualifiedName": "public.lease_contracts",
      "label": "Hợp đồng thuê",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Hợp đồng thuê.",
      "grain": "1 hợp đồng thuê 1 căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "tenant_id",
          "type": "uuid"
        },
        {
          "name": "lease_start",
          "type": "date"
        },
        {
          "name": "lease_end",
          "type": "date"
        },
        {
          "name": "monthly_rent",
          "type": "numeric(18,2)"
        },
        {
          "name": "rent_due_day",
          "type": "integer"
        },
        {
          "name": "late_fee",
          "type": "numeric(18,2)"
        },
        {
          "name": "grace_days",
          "type": "integer"
        },
        {
          "name": "currency",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "legal_documents",
      "qualifiedName": "public.legal_documents",
      "label": "Hồ sơ pháp lý",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Hồ sơ pháp lý.",
      "grain": "1 hồ sơ pháp lý của dự án hoặc căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "document_type",
          "type": "text"
        },
        {
          "name": "document_number",
          "type": "text"
        },
        {
          "name": "issue_date",
          "type": "date"
        },
        {
          "name": "issuing_authority",
          "type": "text"
        },
        {
          "name": "file_url",
          "type": "text"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "loyalty_members",
      "qualifiedName": "public.loyalty_members",
      "label": "Hội viên thân thiết",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Hội viên thân thiết.",
      "grain": "1 hội viên chương trình khách hàng thân thiết (1-1 với customers).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "points_balance",
          "type": "integer"
        },
        {
          "name": "lifetime_points",
          "type": "integer"
        },
        {
          "name": "tier",
          "type": "text"
        },
        {
          "name": "membership_group",
          "type": "text"
        },
        {
          "name": "joined_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "loyalty_points",
      "qualifiedName": "public.loyalty_points",
      "label": "Điểm tích luỹ",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Điểm tích luỹ.",
      "grain": "1 giao dịch điểm thưởng (ledger, append-only).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "loyalty_member_id",
          "type": "uuid"
        },
        {
          "name": "points",
          "type": "integer"
        },
        {
          "name": "transaction_type",
          "type": "text"
        },
        {
          "name": "source",
          "type": "text"
        },
        {
          "name": "reference_id",
          "type": "uuid"
        },
        {
          "name": "expiry_date",
          "type": "date"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "maintenance_requests",
      "qualifiedName": "public.maintenance_requests",
      "label": "Yêu cầu bảo trì",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Yêu cầu bảo trì.",
      "grain": "1 yêu cầu bảo trì.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "tenant_id",
          "type": "uuid"
        },
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "priority",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "reported_date",
          "type": "timestamp with time zone"
        },
        {
          "name": "resolved_date",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "management_fee_invoices",
      "qualifiedName": "public.management_fee_invoices",
      "label": "Cụm 7",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Cụm 7 — Ngữ cảnh phí quản lý (unit/tenant/kỳ/phí trễ hạn). Số tiền, hạn và trạng thái thanh toán CHỈ nằm ở invoices (DA-013). Dùng view v_management_fees để truy vấn.",
      "grain": "See CK1 data dictionary.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "tenant_id",
          "type": "uuid"
        },
        {
          "name": "invoice_id",
          "type": "uuid"
        },
        {
          "name": "billing_period",
          "type": "date"
        },
        {
          "name": "late_fee_applied",
          "type": "numeric(18,2)"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "marketing_campaigns",
      "qualifiedName": "public.marketing_campaigns",
      "label": "Chiến dịch marketing",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Chiến dịch marketing.",
      "grain": "1 chiến dịch marketing.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "parent_campaign_id",
          "type": "uuid"
        },
        {
          "name": "campaign_number",
          "type": "text"
        },
        {
          "name": "campaign_name",
          "type": "text"
        },
        {
          "name": "campaign_type",
          "type": "text"
        },
        {
          "name": "campaign_category",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "owner_agent_id",
          "type": "uuid"
        },
        {
          "name": "region_code",
          "type": "text"
        },
        {
          "name": "start_date",
          "type": "timestamp with time zone"
        },
        {
          "name": "end_date",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "mortgage_loans",
      "qualifiedName": "public.mortgage_loans",
      "label": "Vay thế chấp",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Vay thế chấp.",
      "grain": "1 khoản vay ngân hàng gắn 1 hợp đồng.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "bank_name",
          "type": "text"
        },
        {
          "name": "loan_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "interest_rate",
          "type": "numeric(5,2)"
        },
        {
          "name": "loan_term_months",
          "type": "integer"
        },
        {
          "name": "approval_status",
          "type": "text"
        },
        {
          "name": "approval_date",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "move_in_out_records",
      "qualifiedName": "public.move_in_out_records",
      "label": "Biên bản nhận/trả nhà",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Biên bản nhận/trả nhà.",
      "grain": "1 lần dọn vào/dọn ra theo 1 hợp đồng thuê.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "lease_id",
          "type": "uuid"
        },
        {
          "name": "record_type",
          "type": "text"
        },
        {
          "name": "record_date",
          "type": "date"
        },
        {
          "name": "condition_notes",
          "type": "text"
        },
        {
          "name": "inspector_user_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "negotiation_logs",
      "qualifiedName": "public.negotiation_logs",
      "label": "Nhật ký thương lượng",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Nhật ký thương lượng.",
      "grain": "1 vòng thương lượng giá của 1 deal.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "opportunity_id",
          "type": "uuid"
        },
        {
          "name": "round_number",
          "type": "integer"
        },
        {
          "name": "proposed_price",
          "type": "numeric(18,2)"
        },
        {
          "name": "counter_price",
          "type": "numeric(18,2)"
        },
        {
          "name": "competitor_mentioned",
          "type": "text"
        },
        {
          "name": "competitor_notes",
          "type": "text"
        },
        {
          "name": "negotiated_by_agent_id",
          "type": "uuid"
        },
        {
          "name": "outcome",
          "type": "text"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "opportunity_stages",
      "qualifiedName": "public.opportunity_stages",
      "label": "Lịch sử giai đoạn deal",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Lịch sử giai đoạn deal.",
      "grain": "1 lần deal đi qua 1 giai đoạn (lịch sử stage).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "opportunity_id",
          "type": "uuid"
        },
        {
          "name": "stage",
          "type": "text"
        },
        {
          "name": "entered_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "exited_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "duration_hours",
          "type": "numeric(10,2)"
        },
        {
          "name": "performed_by_agent_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "ownership_transfers",
      "qualifiedName": "public.ownership_transfers",
      "label": "Chuyển nhượng",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Chuyển nhượng.",
      "grain": "1 lần chuyển nhượng quyền mua trên 1 hợp đồng.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "from_party_id",
          "type": "uuid"
        },
        {
          "name": "to_party_id",
          "type": "uuid"
        },
        {
          "name": "transfer_date",
          "type": "date"
        },
        {
          "name": "transfer_reason",
          "type": "text"
        },
        {
          "name": "regulatory_reference",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "payment_installments",
      "qualifiedName": "public.payment_installments",
      "label": "Đợt thanh toán",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Đợt thanh toán.",
      "grain": "1 đợt thanh toán trong 1 lịch — amount_due là source of truth (DA-017).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "schedule_id",
          "type": "uuid"
        },
        {
          "name": "installment_number",
          "type": "integer"
        },
        {
          "name": "due_date",
          "type": "date"
        },
        {
          "name": "amount_due",
          "type": "numeric(18,2)"
        },
        {
          "name": "amount_paid",
          "type": "numeric(18,2)"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "paid_date",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "payment_schedules",
      "qualifiedName": "public.payment_schedules",
      "label": "Lịch thanh toán",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Lịch thanh toán.",
      "grain": "1 lịch thanh toán của 1 hợp đồng.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "schedule_type",
          "type": "text"
        },
        {
          "name": "total_installments",
          "type": "integer"
        },
        {
          "name": "installment_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "frequency",
          "type": "text"
        },
        {
          "name": "start_date",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "payment_transactions",
      "qualifiedName": "public.payment_transactions",
      "label": "Giao dịch thanh toán",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Giao dịch thanh toán.",
      "grain": "1 lần khách thanh toán tiền.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "installment_id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        },
        {
          "name": "voucher_id",
          "type": "uuid"
        },
        {
          "name": "amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "payment_method",
          "type": "text"
        },
        {
          "name": "transaction_ref",
          "type": "text"
        },
        {
          "name": "transaction_date",
          "type": "timestamp with time zone"
        },
        {
          "name": "recorded_by_user_id",
          "type": "uuid"
        },
        {
          "name": "notes",
          "type": "text"
        }
      ]
    },
    {
      "schema": "public",
      "name": "project_amenities",
      "qualifiedName": "public.project_amenities",
      "label": "Tiện ích dự án",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Tiện ích dự án.",
      "grain": "1 tiện ích của 1 dự án.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "amenity_name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "project_phases",
      "qualifiedName": "public.project_phases",
      "label": "Phân kỳ dự án",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Phân kỳ dự án.",
      "grain": "1 phân kỳ của 1 dự án.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "phase_name",
          "type": "text"
        },
        {
          "name": "phase_number",
          "type": "integer"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "total_units_in_phase",
          "type": "integer"
        },
        {
          "name": "launch_date",
          "type": "date"
        },
        {
          "name": "expected_handover_date",
          "type": "date"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "projects",
      "qualifiedName": "public.projects",
      "label": "Dự án BĐS",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Dự án BĐS.",
      "grain": "1 dự án BĐS.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "project_code",
          "type": "text"
        },
        {
          "name": "project_name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "developer_name",
          "type": "text"
        },
        {
          "name": "architect_name",
          "type": "text"
        },
        {
          "name": "project_type",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "address",
          "type": "text"
        },
        {
          "name": "total_floor_area_sqm",
          "type": "numeric(14,2)"
        },
        {
          "name": "total_units",
          "type": "integer"
        },
        {
          "name": "parking_spots",
          "type": "integer"
        },
        {
          "name": "ownership_type",
          "type": "text"
        },
        {
          "name": "financing_notes",
          "type": "text"
        },
        {
          "name": "estimated_cost",
          "type": "numeric(18,2)"
        },
        {
          "name": "estimated_cost_currency",
          "type": "text"
        },
        {
          "name": "expected_completion_year",
          "type": "integer"
        },
        {
          "name": "latitude",
          "type": "numeric(10,7)"
        },
        {
          "name": "longitude",
          "type": "numeric(10,7)"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "promo_code_usages",
      "qualifiedName": "public.promo_code_usages",
      "label": "Lượt sử dụng mã ưu đãi (bảng bổ sung)",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Lượt sử dụng mã ưu đãi (bảng bổ sung).",
      "grain": "1 lần áp dụng 1 mã khuyến mãi.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "promo_code_id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "opportunity_id",
          "type": "uuid"
        },
        {
          "name": "quotation_id",
          "type": "uuid"
        },
        {
          "name": "discount_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "used_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "promo_codes",
      "qualifiedName": "public.promo_codes",
      "label": "Mã ưu đãi",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Mã ưu đãi.",
      "grain": "1 mã khuyến mãi cụ thể.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "promotion_id",
          "type": "uuid"
        },
        {
          "name": "code",
          "type": "text"
        },
        {
          "name": "max_redemptions",
          "type": "integer"
        },
        {
          "name": "times_redeemed",
          "type": "integer"
        },
        {
          "name": "active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "promotional_events",
      "qualifiedName": "public.promotional_events",
      "label": "Sự kiện quảng bá",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Sự kiện quảng bá.",
      "grain": "1 sự kiện mở bán/tri ân.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "campaign_id",
          "type": "uuid"
        },
        {
          "name": "event_name",
          "type": "text"
        },
        {
          "name": "event_description",
          "type": "text"
        },
        {
          "name": "event_type",
          "type": "text"
        },
        {
          "name": "event_organizer",
          "type": "text"
        },
        {
          "name": "event_url",
          "type": "text"
        },
        {
          "name": "location",
          "type": "text"
        },
        {
          "name": "start_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "end_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "is_cancelled",
          "type": "boolean"
        },
        {
          "name": "registrants_count",
          "type": "integer"
        },
        {
          "name": "attendees_count",
          "type": "integer"
        },
        {
          "name": "no_shows_count",
          "type": "integer"
        },
        {
          "name": "cancellations_count",
          "type": "integer"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "promotions",
      "qualifiedName": "public.promotions",
      "label": "Chương trình khuyến mãi",
      "domain": "Marketing",
      "cluster": 4,
      "description": "Chương trình khuyến mãi.",
      "grain": "1 chương trình khuyến mãi.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "campaign_id",
          "type": "uuid"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "promotion_type",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "duration_days",
          "type": "integer"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "valid_from",
          "type": "timestamp with time zone"
        },
        {
          "name": "valid_to",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "property_viewings",
      "qualifiedName": "public.property_viewings",
      "label": "Lượt xem tin online",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Lượt xem tin online.",
      "grain": "1 lượt xem căn online của 1 contact.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contact_id",
          "type": "uuid"
        },
        {
          "name": "property_id",
          "type": "uuid"
        },
        {
          "name": "viewed_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "view_source",
          "type": "text"
        }
      ]
    },
    {
      "schema": "public",
      "name": "quotation_items",
      "qualifiedName": "public.quotation_items",
      "label": "Chi tiết báo giá",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Chi tiết báo giá.",
      "grain": "1 dòng hạng mục trong 1 báo giá.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "quotation_id",
          "type": "uuid"
        },
        {
          "name": "category",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "qty",
          "type": "numeric(10,2)"
        },
        {
          "name": "unit_price",
          "type": "numeric(18,2)"
        },
        {
          "name": "discount_pct",
          "type": "numeric(5,2)"
        },
        {
          "name": "sort_order",
          "type": "integer"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "line_total",
          "type": "numeric(18,2)"
        }
      ]
    },
    {
      "schema": "public",
      "name": "quotations",
      "qualifiedName": "public.quotations",
      "label": "Báo giá",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Báo giá.",
      "grain": "1 báo giá (1 phiên bản) gửi khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "opportunity_id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "contact_name",
          "type": "text"
        },
        {
          "name": "contact_email",
          "type": "text"
        },
        {
          "name": "salesperson_id",
          "type": "uuid"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "quote_total",
          "type": "numeric(18,2)"
        },
        {
          "name": "valid_days",
          "type": "integer"
        },
        {
          "name": "version",
          "type": "integer"
        },
        {
          "name": "cloned_from_quote_id",
          "type": "uuid"
        },
        {
          "name": "is_primary_quote",
          "type": "boolean"
        },
        {
          "name": "pdf_path",
          "type": "text"
        },
        {
          "name": "expires_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "sent_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "viewed_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "accepted_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "rejected_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "resolution_logs",
      "qualifiedName": "public.resolution_logs",
      "label": "Biên bản xử lý",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Biên bản xử lý.",
      "grain": "1 sự kiện xử lý trên 1 ticket/khiếu nại (audit log).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "ticket_id",
          "type": "uuid"
        },
        {
          "name": "complaint_id",
          "type": "uuid"
        },
        {
          "name": "event_type",
          "type": "text"
        },
        {
          "name": "actor_agent_id",
          "type": "uuid"
        },
        {
          "name": "before_value",
          "type": "text"
        },
        {
          "name": "after_value",
          "type": "text"
        },
        {
          "name": "note",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "sales_contracts",
      "qualifiedName": "public.sales_contracts",
      "label": "Hợp đồng mua bán",
      "domain": "Sales & Contracts",
      "cluster": 6,
      "description": "Hợp đồng mua bán.",
      "grain": "1 hợp đồng mua bán 1 căn (chỉ bán, DA-012).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "contract_number",
          "type": "text"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "opportunity_id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "contract_type",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "total_value",
          "type": "numeric(18,2)"
        },
        {
          "name": "deposit_amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "payment_type",
          "type": "text"
        },
        {
          "name": "regulatory_reference",
          "type": "text"
        },
        {
          "name": "signed_date",
          "type": "date"
        },
        {
          "name": "start_date",
          "type": "date"
        },
        {
          "name": "end_date",
          "type": "date"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "sales_opportunities",
      "qualifiedName": "public.sales_opportunities",
      "label": "Cơ hội bán hàng (Deal)",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Cơ hội bán hàng (Deal).",
      "grain": "1 cơ hội bán hàng (deal) cho 1 khách/1 căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "contact_id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "listing_id",
          "type": "uuid"
        },
        {
          "name": "amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "stage",
          "type": "text"
        },
        {
          "name": "probability",
          "type": "integer"
        },
        {
          "name": "forecast_category",
          "type": "text"
        },
        {
          "name": "opportunity_type",
          "type": "text"
        },
        {
          "name": "lead_source",
          "type": "text"
        },
        {
          "name": "assigned_agent_id",
          "type": "uuid"
        },
        {
          "name": "is_closed",
          "type": "boolean"
        },
        {
          "name": "is_won",
          "type": "boolean"
        },
        {
          "name": "closed_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "contract_signed_date",
          "type": "timestamp with time zone"
        },
        {
          "name": "lost_reason",
          "type": "text"
        },
        {
          "name": "next_step",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "quote_count",
          "type": "integer"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "expected_revenue",
          "type": "numeric(18,2)"
        }
      ]
    },
    {
      "schema": "public",
      "name": "service_contracts",
      "qualifiedName": "public.service_contracts",
      "label": "Hợp đồng dịch vụ",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Hợp đồng dịch vụ.",
      "grain": "1 hợp đồng dịch vụ với nhà thầu.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "vendor_id",
          "type": "uuid"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "service_type",
          "type": "text"
        },
        {
          "name": "contract_start",
          "type": "date"
        },
        {
          "name": "contract_end",
          "type": "date"
        },
        {
          "name": "monthly_fee",
          "type": "numeric(18,2)"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "site_visit_feedbacks",
      "qualifiedName": "public.site_visit_feedbacks",
      "label": "Phản hồi sau xem nhà",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Phản hồi sau xem nhà.",
      "grain": "1 phản hồi sau 1 buổi xem nhà.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "site_visit_id",
          "type": "uuid"
        },
        {
          "name": "interest_level",
          "type": "text"
        },
        {
          "name": "feedback_notes",
          "type": "text"
        },
        {
          "name": "objections",
          "type": "text"
        },
        {
          "name": "next_action",
          "type": "text"
        },
        {
          "name": "submitted_by_agent_id",
          "type": "uuid"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "site_visit_schedules",
      "qualifiedName": "public.site_visit_schedules",
      "label": "Lịch xem nhà thực tế",
      "domain": "CRM & Leads",
      "cluster": 2,
      "description": "Lịch xem nhà thực tế.",
      "grain": "1 lịch dẫn khách đi xem dự án/căn thực tế.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "lead_id",
          "type": "uuid"
        },
        {
          "name": "opportunity_id",
          "type": "uuid"
        },
        {
          "name": "contact_id",
          "type": "uuid"
        },
        {
          "name": "property_id",
          "type": "uuid"
        },
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "scheduled_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "assigned_agent_id",
          "type": "uuid"
        },
        {
          "name": "transport_arranged",
          "type": "boolean"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "sla_policies",
      "qualifiedName": "public.sla_policies",
      "label": "Cam kết thời gian xử lý (SLA)",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Cam kết thời gian xử lý (SLA).",
      "grain": "1 cam kết SLA theo mức ưu tiên (danh mục).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "priority",
          "type": "text"
        },
        {
          "name": "first_response_target_minutes",
          "type": "integer"
        },
        {
          "name": "resolution_target_minutes",
          "type": "integer"
        },
        {
          "name": "business_hours_only",
          "type": "boolean"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "support_tickets",
      "qualifiedName": "public.support_tickets",
      "label": "Phiếu hỗ trợ",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Phiếu hỗ trợ.",
      "grain": "1 yêu cầu hỗ trợ/khiếu nại của khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "ticket_number",
          "type": "text"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "opportunity_id",
          "type": "uuid"
        },
        {
          "name": "category_id",
          "type": "uuid"
        },
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "priority",
          "type": "text"
        },
        {
          "name": "assigned_agent_id",
          "type": "uuid"
        },
        {
          "name": "escalation_tier",
          "type": "text"
        },
        {
          "name": "reopen_count",
          "type": "integer"
        },
        {
          "name": "sla_due_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "resolved_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "closed_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "sla_policy_id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "contract_id",
          "type": "uuid"
        }
      ]
    },
    {
      "schema": "public",
      "name": "survey_responses",
      "qualifiedName": "public.survey_responses",
      "label": "Kết quả khảo sát",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Kết quả khảo sát.",
      "grain": "1 lượt trả lời khảo sát của 1 khách.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "survey_id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "answers",
          "type": "jsonb"
        },
        {
          "name": "nps_score",
          "type": "integer"
        },
        {
          "name": "submitted_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "surveys",
      "qualifiedName": "public.surveys",
      "label": "Khảo sát",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Khảo sát.",
      "grain": "1 khảo sát (bộ câu hỏi JSONB).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "survey_type",
          "type": "text"
        },
        {
          "name": "questions",
          "type": "jsonb"
        },
        {
          "name": "single_response_p",
          "type": "boolean"
        },
        {
          "name": "enabled_p",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "tax_invoices",
      "qualifiedName": "public.tax_invoices",
      "label": "Hóa đơn điện tử VAT",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Hóa đơn điện tử VAT.",
      "grain": "1 hoá đơn điện tử phát hành cho 1 hoá đơn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "invoice_id",
          "type": "uuid"
        },
        {
          "name": "tax_invoice_number",
          "type": "text"
        },
        {
          "name": "tax_code_buyer",
          "type": "text"
        },
        {
          "name": "issue_date",
          "type": "date"
        },
        {
          "name": "e_invoice_status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "tax_profiles",
      "qualifiedName": "public.tax_profiles",
      "label": "Thông tin thuế",
      "domain": "Customer Identity",
      "cluster": 1,
      "description": "Thông tin thuế.",
      "grain": "1 hồ sơ thuế/xuất hoá đơn của 1 khách (1-1).",
      "columns": [
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "tax_code",
          "type": "text"
        },
        {
          "name": "billing_name",
          "type": "text"
        },
        {
          "name": "billing_address",
          "type": "text"
        },
        {
          "name": "billing_zip",
          "type": "text"
        },
        {
          "name": "invoice_email",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "tenants",
      "qualifiedName": "public.tenants",
      "label": "Cụm 7",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Cụm 7 — Vai trò \"khách thuê\" của 1 customer. Họ tên/SĐT/email/CCCD lấy từ customers + kyc_documents (DA-014).",
      "grain": "See CK1 data dictionary.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "customer_id",
          "type": "uuid"
        },
        {
          "name": "emergency_contact",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "ticket_categories",
      "qualifiedName": "public.ticket_categories",
      "label": "Danh mục loại ticket",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Danh mục loại ticket.",
      "grain": "1 loại ticket (danh mục).",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "default_priority",
          "type": "text"
        },
        {
          "name": "escalation_keywords",
          "type": "text"
        },
        {
          "name": "auto_assign_to",
          "type": "uuid"
        },
        {
          "name": "routing_team",
          "type": "text"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "ticket_comments",
      "qualifiedName": "public.ticket_comments",
      "label": "Trao đổi trong ticket",
      "domain": "Customer Service",
      "cluster": 3,
      "description": "Trao đổi trong ticket.",
      "grain": "1 bình luận/ghi chú trên 1 ticket.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "ticket_id",
          "type": "uuid"
        },
        {
          "name": "user_id",
          "type": "uuid"
        },
        {
          "name": "message",
          "type": "text"
        },
        {
          "name": "old_value",
          "type": "text"
        },
        {
          "name": "new_value",
          "type": "text"
        },
        {
          "name": "is_internal",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "unit_amenities",
      "qualifiedName": "public.unit_amenities",
      "label": "Tiện ích căn",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Tiện ích căn.",
      "grain": "1 tiện ích của 1 căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "amenity_name",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "unit_media",
      "qualifiedName": "public.unit_media",
      "label": "Hình ảnh/video căn",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Hình ảnh/video căn.",
      "grain": "1 ảnh/video của 1 căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "media_type",
          "type": "text"
        },
        {
          "name": "url",
          "type": "text"
        },
        {
          "name": "is_primary",
          "type": "boolean"
        },
        {
          "name": "display_order",
          "type": "integer"
        },
        {
          "name": "uploaded_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "unit_price_history",
      "qualifiedName": "public.unit_price_history",
      "label": "Lịch sử giá căn",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Lịch sử giá căn.",
      "grain": "1 mức giá có hiệu lực của 1 căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "price",
          "type": "numeric(18,2)"
        },
        {
          "name": "price_currency",
          "type": "text"
        },
        {
          "name": "price_type",
          "type": "text"
        },
        {
          "name": "effective_date",
          "type": "date"
        },
        {
          "name": "set_by_user_id",
          "type": "uuid"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "unit_status_history",
      "qualifiedName": "public.unit_status_history",
      "label": "Lịch sử trạng thái căn",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Lịch sử trạng thái căn.",
      "grain": "1 lần đổi trạng thái của 1 căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "old_status",
          "type": "text"
        },
        {
          "name": "new_status",
          "type": "text"
        },
        {
          "name": "changed_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "changed_by_user_id",
          "type": "uuid"
        },
        {
          "name": "reason",
          "type": "text"
        }
      ]
    },
    {
      "schema": "public",
      "name": "unit_types",
      "qualifiedName": "public.unit_types",
      "label": "Loại căn",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Loại căn.",
      "grain": "1 loại căn (mẫu thiết kế) của 1 dự án.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "type_name",
          "type": "text"
        },
        {
          "name": "bedrooms",
          "type": "integer"
        },
        {
          "name": "bathrooms",
          "type": "integer"
        },
        {
          "name": "typical_area_sqm",
          "type": "numeric(10,2)"
        },
        {
          "name": "base_price",
          "type": "numeric(18,2)"
        },
        {
          "name": "base_price_currency",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "units",
      "qualifiedName": "public.units",
      "label": "Cụm 5",
      "domain": "Projects & Property",
      "cluster": 5,
      "description": "Cụm 5 — Căn hộ / lô đất. CANONICAL ENTITY \"Unit\". Alias: unit, property, listing, apartment, lot, căn, căn hộ, lô. Mọi cột *_id trỏ về bảng này đều mang nghĩa unit_id (DA-011).",
      "grain": "See CK1 data dictionary.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "project_id",
          "type": "uuid"
        },
        {
          "name": "building_id",
          "type": "uuid"
        },
        {
          "name": "floor_id",
          "type": "uuid"
        },
        {
          "name": "unit_type_id",
          "type": "uuid"
        },
        {
          "name": "unit_code",
          "type": "text"
        },
        {
          "name": "suite",
          "type": "text"
        },
        {
          "name": "area_sqm",
          "type": "numeric(10,2)"
        },
        {
          "name": "use_type",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "visibility",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "notes",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "phase_id",
          "type": "uuid"
        }
      ]
    },
    {
      "schema": "public",
      "name": "utility_readings",
      "qualifiedName": "public.utility_readings",
      "label": "Chỉ số điện nước",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Chỉ số điện nước.",
      "grain": "1 lần ghi chỉ số điện/nước của 1 căn.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "utility_type",
          "type": "text"
        },
        {
          "name": "reading_date",
          "type": "date"
        },
        {
          "name": "reading_value",
          "type": "numeric(14,2)"
        },
        {
          "name": "previous_value",
          "type": "numeric(14,2)"
        },
        {
          "name": "unit_of_measure",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "vendors",
      "qualifiedName": "public.vendors",
      "label": "Nhà cung cấp dịch vụ",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Nhà cung cấp dịch vụ.",
      "grain": "1 nhà cung cấp/nhà thầu.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "vendor_name",
          "type": "text"
        },
        {
          "name": "category",
          "type": "text"
        },
        {
          "name": "phone",
          "type": "text"
        },
        {
          "name": "email",
          "type": "text"
        },
        {
          "name": "rating",
          "type": "numeric(3,2)"
        },
        {
          "name": "is_active",
          "type": "boolean"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "vouchers",
      "qualifiedName": "public.vouchers",
      "label": "Phiếu thu/chi",
      "domain": "Finance & Accounting",
      "cluster": 8,
      "description": "Phiếu thu/chi.",
      "grain": "1 phiếu thu/chi.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "voucher_number",
          "type": "text"
        },
        {
          "name": "voucher_type",
          "type": "text"
        },
        {
          "name": "account_id",
          "type": "uuid"
        },
        {
          "name": "cost_center_id",
          "type": "uuid"
        },
        {
          "name": "amount",
          "type": "numeric(18,2)"
        },
        {
          "name": "voucher_date",
          "type": "date"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "created_by_user_id",
          "type": "uuid"
        },
        {
          "name": "approved_by_user_id",
          "type": "uuid"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        }
      ]
    },
    {
      "schema": "public",
      "name": "work_orders",
      "qualifiedName": "public.work_orders",
      "label": "Lệnh sửa chữa",
      "domain": "Property Operations",
      "cluster": 7,
      "description": "Lệnh sửa chữa.",
      "grain": "1 lệnh công việc giao nhà thầu.",
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "maintenance_request_id",
          "type": "uuid"
        },
        {
          "name": "unit_id",
          "type": "uuid"
        },
        {
          "name": "vendor_id",
          "type": "uuid"
        },
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "description",
          "type": "text"
        },
        {
          "name": "priority",
          "type": "text"
        },
        {
          "name": "status",
          "type": "text"
        },
        {
          "name": "scheduled_date",
          "type": "date"
        },
        {
          "name": "completed_date",
          "type": "date"
        },
        {
          "name": "cost",
          "type": "numeric(18,2)"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone"
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone"
        }
      ]
    }
  ]
};
