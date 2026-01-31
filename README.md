# Table & Form Duplicator Tool

## Overview

The **Table & Form Duplicator** is a powerful web-based tool designed to duplicate table structures and forms within the GAB Platform. It provides an intuitive interface for copying tables with their fields, custom field types, and associated forms, including complex form logic and conditional rules.

## Tools in this repo

- **`gab_tableDuplicator.html`**: Table & Form Duplicator (duplicate table schema + optionally duplicate forms + rules)
- **`gab_DataValidator.html`**: Excel → Table Field Mapper / Data Validator (map Excel columns to FieldName tokens, validate lookups/enums, export import-safe CSV, optional `postdata` import)

### Quick start

1. Open the desired HTML file in a modern browser (Chrome recommended).
2. Ensure you are logged into the GAB Platform in that browser so `localStorage` contains your encrypted token.
3. Use the tool UI to perform the workflow (duplication or mapping/export/import). For debugging, open DevTools Console.

## Features

### Core Capabilities

- **Table Structure Duplication**: Clone entire table structures with all custom fields
- **Field Mapping & Transformation**: Remap field keys and transform field types during duplication
- **Form Duplication**: Copy forms with complete layout preservation including:
  - Multiple tabs with custom layouts
  - Header fields
  - Design elements (HTML elements and Dividers)
  - Form rules (conditional logic) with field-key remapping
- **Form Structure Comparison**: Interactive preview showing what will be duplicated:
  - Side-by-side comparison of original vs. expected form structure
  - Visual indicators for included/excluded fields
  - Dynamic validation against source table fields
  - Identifies fields from related tables that won't be copied
  - Summary statistics with detailed exclusion reasons
- **Smart Field Filtering**: Automatically excludes:
  - System fields (id, datecreated, datemodified, createdby, modifiedby)
  - Relationship fields
  - Formula fields
  - Lookup fields (external table references)
  - Fields from related tables not being duplicated
- **Interactive Field Editor**: Edit field names and types before duplication, and **exclude fields** so they are not created in the new table
- **Selective Form Duplication**: Choose which forms to duplicate via checkboxes

### Technical Features

- **Field Key Remapping**: Automatically maps old field keys to new field keys for form integrity
- **Form Rules Support**: Copies form rules from the dedicated endpoint and remaps field keys. Any rule conditions/actions referencing excluded or uncreated fields are filtered out for safety.
- **Design Element Support**: Full support for HTML and DIVIDER elements with style preservation
- **Dynamic Field Validation**: Cross-references form fields with source table to identify missing dependencies
- **External Dependency Handling**: Intelligently excludes features requiring external resources:
  - EmbeddedReports (reference other tables)
  - EmbeddedForms (reference other tables)
  - DataFilters (can be added post-creation)
- **Dropdown Value Preservation**: Fetches and copies ENUM/ENUM2 field options
- **Payload Validation**: Built-in validation to catch common API issues
- **Technical Mode**: Toggle to show/hide API testing tools
- **Professional UI**: Clean, accessible color scheme optimized for readability

## Installation & Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Access to the GAB Platform
- Valid user token with appropriate permissions

### Configuration

1. **User Token**: The tool automatically retrieves your encrypted token from localStorage
   ```javascript
   // Token is decrypted using AES encryption
   const encryptedToken = localStorage.getItem("token");
   userToken = CryptoJS.AES.decrypt(encryptedToken, aesKEY).toString(CryptoJS.enc.Utf8);
   ```

2. **API Endpoint**: Set to GAB Platform production server
   ```javascript
   const SERVER_URL_PAGE = "https://api.ignatius.io";
   ```

## Usage Guide

### Basic Workflow

1. **Select Source Table**
   - Enter Source Application Key
   - Click "Load Tables" to fetch available tables
   - Select the table you want to duplicate

2. **Review & Edit Fields**
   - View all fields that will be duplicated
   - Edit field names inline
   - Change field types via dropdown
   - Toggle **Include** off to exclude a field from being created in the new table
   - System fields, relationships, formulas, and lookups are automatically filtered out

3. **Select Forms (Optional)**
   - Review available forms in the source table
   - Check the boxes next to forms you want to duplicate
   - Toggle **Include Form Rules** on/off (defaults ON)
   - Click "View Structure" to inspect form details and see comparison:
     - Green checkmarks (✓) indicate fields that will be duplicated
     - Red X marks (✗) indicate fields that will be excluded
     - View detailed exclusion reasons (relationship fields, formulas, etc.)
     - See summary statistics of included vs. excluded fields
     - Identify fields from related tables that won't be copied

4. **Configure Destination**
   - Enter Destination Application Key
   - Click "Lookup" to verify the application
   - Enter New Table Name
   - Enter Singular Name for records

5. **Duplicate**
   - Click "Duplicate Table" to start the process
   - Monitor progress in console
   - Review success/failure summary

### Field Type Support

The tool supports conversion between these field types:

| Field Type | Display Name | Description |
|------------|--------------|-------------|
| `VARCHAR` | Text (Short) | Short text field |
| `TEXT` | Text (Long) | Long text field |
| `LONGTEXT` | Text (Very Long) | Very long text field |
| `INT` | Number (Integer) | Whole numbers only |
| `DOUBLE` | Number (Decimal) | Numbers with decimals |
| `DECIMAL` | Number (Precise) | Precise decimal numbers |
| `TINYINT(1)` | Checkbox | True/False checkbox |
| `DATE` | Date | Date only |
| `DATETIME` | Date & Time | Date and time |
| `ENUM` | Dropdown | Single selection dropdown |
| `EMAIL` | Email | Email address |
| `PHONE` | Phone | Phone number |
| `URL` | URL | Web address |

### Form Structure Comparison

The tool provides a comprehensive form comparison feature that shows exactly what will be duplicated:

#### Visual Indicators
- **✓ Green Checkmark**: Field will be successfully duplicated
- **✗ Red X**: Field will be excluded with reason badge
- **Blue Info Badge**: Design elements (HTML/Divider) that will be included

#### Summary Statistics
- Total fields in the original form
- Number of fields that will be duplicated
- Number of fields that will be excluded
- Expandable list showing all excluded fields with reasons

#### Exclusion Reasons
- **System Field**: Auto-created fields (id, datecreated, etc.)
- **Relationship Field**: Fields linking to other tables
- **Formula Field**: Calculated fields with potential dependencies  
- **Lookup Field**: Fields referencing external table data
- **Not in Source Table**: Fields from related tables (e.g., "Applicant - Name" from related Applicants table)

#### Design Elements
- **HTML Elements**: Text blocks, headers, custom styling - always duplicated
- **Dividers**: Visual separators - always duplicated
- Both preserve positioning, styling, and content

## Technical Architecture

### Form Transformation Pipeline

```
Source Form → Load Structure → Transform → Validate → Create
                    ↓              ↓          ↓
              Field Mapping   Clean Data   Check
              Tab Mapping    Remove Nulls  Structure
              Rules Mapping  Fix Undefined Issues
```

### Key Functions

#### Table & Field Creation

- **`createTableInDestination(tableName, singularName)`**: Creates new table via API
- **`createFieldInTable(sourceField, targetTableKey)`**: Creates individual fields with value fetching
- **`fetchDropdownValues(fieldKey)`**: Retrieves ENUM/ENUM2 options

#### Form Duplication

- **`createFormInTable(sourceFormKey, targetTableKey)`**: Orchestrates form creation
- **`loadFormStructureForDuplication(formKey)`**: Loads complete form structure
- **`loadFormRulesForDuplication(formKey, tableKey)`**: Loads rules via `/api/form/getformrules`
- **`transformFormStructure(sourceForm, targetTableKey)`**: Main transformation function
- **`shouldExcludeField(field)`**: Validates if a field should be excluded from duplication
- **`displayFormStructure(formData, formName)`**: Renders form comparison view with exclusion analysis

#### Form Transformation Functions

- **`transformTabData(tabData, targetTableKey)`**: Transforms tab structure
- **`transformFormColumn(column, targetTableKey)`**: Transforms individual fields
- **`transformFormFieldSetting(setting, newFieldKey)`**: Transforms field settings
- **`transformHeaderFields(headerFields, targetTableKey)`**: Transforms header fields
- **`transformFormRules(formRules)`**: Transforms and filters rules (supports the `getformrules` response shape)
- **`transformFormConditionGroups(conditionGroups, ...)`**: Transforms "IF" conditions and drops unmapped ones
- **`transformFormRuleConditions(ruleConditions, ...)`**: Transforms "THEN" actions and drops unmapped ones

#### Utility Functions

- **`mapFieldKey(sourceKey)`**: Maps old field keys to new ones
- **`cleanUndefinedValues(obj)`**: Recursively removes undefined values
- **`validateFormPayload(payload)`**: Validates form structure before submission

### Data Structures

#### Field Key Mapping
```javascript
fieldKeyMapping = {
  "old_field_key_1": "new_field_key_1",
  "old_field_key_2": "new_field_key_2",
  // ... maps all created fields
}
```

#### Form Payload Structure
```javascript
{
  ApplicationTableKey: "target_table_key",
  Name: "Form Name",
  Description: "Form description",
  DefaultForm: 0,
  Type: "web",
  HeaderFields: [...],
  TabData: [
    {
      Order: 0,
      Title: "Tab Name",
      Columns: [...],
      Sections: [...],
      Footer: [...]
    }
  ],
  FormRule: [
    {
      FormRuleIndex: 0,
      Name: "Rule Name",
      FormConditionGroups: [...],
      FormRuleConditions: [...]
    }
  ],
  // Excluded: EmbeddedReports, EmbeddedForms, DataFilters
}
```

#### FormRule Structure
```javascript
{
  FormRuleIndex: 0,
  IsFormRuleActive: true,
  Name: "Rule Name",
  FormConditionGroups: [  // "IF" conditions (copied from getformrules; field keys remapped)
    {
      ConditionType: "AND/OR",
      FormGroups: [
        {
          ConditionType: "AND/OR",
          // NOTE: Two shapes exist in the platform; this tool supports both.
          // getformrules shape:
          FormConditions: [
            {
              ConditionGroupType: "field|user|...",
              FieldKey: "mapped_field_key",
              QueryCondition: "empty|is equal|...",
              Value: "comparison_value"
            }
          ]
          // legacy/loadformtoedit shape:
          Conditions: [
            {
              FieldKey: "mapped_field_key",
              Operator: "equals/contains/...",
              Operand: "value",
              Value: "comparison_value"
            }
          ]
        }
      ]
    }
  ],
  FormRuleConditions: [  // "THEN" actions
    {
      Action: "hide/show/require/...",
      Type: "field/tab",
      Value: "mapped_field_key",
      FieldKey: "mapped_field_key",
      DisplayMessage: "...",
      IsTrue: true/false,
      PreventSave: true/false
    }
  ]
}
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/Application/getall` | GET | Retrieve applications |
| `/api/applicationtable/getbyapplicationid` | GET | Get tables by app key |
| `/api/applicationtable` | POST | Create new table |
| `/api/Field/getbytableid` | GET | Get fields by table key |
| `/api/Field/getdropdownvalues` | GET | Get ENUM dropdown values |
| `/api/Field` | POST | Create new field |
| `/api/form/getbytableid` | GET | Get forms by table key |
| `/api/form/loadformtoedit` | GET | Load complete form structure |
| `/api/form/getformrules` | GET | Load form rules for a form/table (used when “Include Form Rules” is ON) |
| `/api/Form` | POST | Create new form |

## Features Excluded from Duplication

The following features are intentionally excluded because they require external dependencies:

### ❌ Excluded Features

1. **EmbeddedReports**
   - Reference other tables not being duplicated
   - Can be manually configured after creation

2. **EmbeddedForms**
   - Reference other tables/forms
   - Can be added post-duplication

3. **FormPdfMaps**
   - PDF mapping configurations
   - Can be set up later

4. **DataFilters**
   - Pre-configured filters
   - Can be added as needed

5. **ApplicationRoleForms**
   - Role-based permissions
   - Should be configured based on destination app

### ✅ Included Features

1. **Form Rules**
   - Conditional show/hide/require/change logic
   - Field keys are remapped to the newly-created field keys
   - Any rule pieces referencing excluded/uncreated fields are filtered out

2. **Form Layout**
   - Multiple tabs
   - Field positioning
   - Section organization

3. **HTML/Design Elements**
   - Text blocks
   - Headers
   - Custom styling

4. **Field Settings**
   - Required/Hidden/Readonly flags
   - Validation rules
   - Default values

## Technical Mode (API Testers)

Toggle "Technical Mode" to access API testing tools:

### Available Testers

1. **Application Lookup**
   - Test `/api/Application/getall`
   - Search by App Key or App ID
   - View filtered results

2. **Get Application Tables**
   - Test `/api/applicationtable/getbyapplicationid`
   - View table count and details

3. **Get Table Fields**
   - Test `/api/Field/getbytableid`
   - Inspect field types and properties

4. **Create Field**
   - Test `/api/Field` POST
   - Load sample payloads
   - Validate field creation

## Error Handling

### Field Creation Errors

```javascript
// Tracks success/failure for each field
fieldResults.push({ 
  success: true/false, 
  field: fieldName, 
  fieldType: fieldType,
  result: apiResponse / error: errorMessage 
});
```

### Form Creation Errors

```javascript
// Common 500 errors often indicate:
// 1. Undefined values in payload
// 2. Missing required field keys
// 3. Invalid ConditionGroup structure
// 4. Reference to non-existent field keys

// Tool provides detailed logging:
console.log('📏 Payload size:', (size), 'KB');
console.log('🔍 Validation issues:', validationIssues);
```

### Validation Checks

The tool performs pre-submission validation:
- Checks for undefined values
- Verifies ConditionGroup structure
- Validates required properties (DisplayRowIndex, DisplayColumnIndex, TabIndex)
- Ensures FormFieldSetting is present for all fields

## Console Logging

Detailed console output for debugging:

```javascript
// Process tracking
🚀 Starting table duplication process...
📝 Step 1: Creating new table...
✅ New table created: [tableKey]
📝 Step 2: Duplicating X custom fields...
✅ Successfully created: X fields
📝 Step 4: Duplicating X form(s)...
   📋 Form transformation: X FormRule(s) included
   ✅ Created form: [formName]
🎉 Duplication complete!

// Field-level logging
🔍 Fetching dropdown values for ENUM field...
✅ Found X option(s) for Multiple Choice field
⏭️ Skipping relationship field: [fieldName]
⏭️ Skipping formula field: [fieldName]
🔑 Mapped: [oldKey] → [newKey]

// Form-level logging
🎨 Including design element: [elementName] (HTML)
⚠️ Skipping field in form (not created): [fieldName]
ℹ️ Total unmapped fields removed from form: X
```

## Known Limitations

1. **External Dependencies**: Cannot duplicate features that reference external tables
2. **Formula Fields**: Not duplicated due to potential field reference issues
3. **Relationship Fields**: Not duplicated as they require existing related tables
4. **Lookup Fields**: Not duplicated as they depend on external table relationships
5. **Complex FormStyleOptions**: Some advanced styling may need manual adjustment
6. **Rules referencing excluded fields**: If you exclude a field that a rule depends on, the tool will drop those rule parts (and may drop the whole rule if it becomes unsafe).

## Best Practices

### Before Duplication

1. ✅ Review source table fields in the preview
2. ✅ Verify destination application is correct
3. ✅ Check form structure in "View Structure" modal
4. ✅ Consider if you need all forms or just specific ones

### After Duplication

1. ✅ Verify field count matches expectations
2. ✅ Check console for any failed fields/forms
3. ✅ Test form functionality in destination app
4. ✅ Add EmbeddedReports if needed
5. ✅ Configure permissions (ApplicationRoleForms)
6. ✅ Add DataFilters if required

### Troubleshooting

**Fields failing to create:**
- Check console for specific error messages
- Verify field type is supported
- Ensure no circular dependencies

**Forms failing to create:**
- Check for unmapped field references
- Verify all required fields were created successfully
- Review payload size (very large forms may timeout)
- Check ConditionGroup structure in console output

**Missing form elements:**
- Design elements (HTML) should be preserved
- Check if source fields were relationship/formula fields
- Verify field key mapping in console logs

## Dependencies

- **jQuery 3.7.1**: DOM manipulation and AJAX
- **Bootstrap 5.3.2**: UI framework
- **DataTables 1.13.7**: Interactive field table
- **CryptoJS 4.2.0**: Token decryption
- **Bootstrap Icons 1.11.1**: UI icons

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Version History

### v1.2.0 (Current - December 2025)
- **Field Include/Exclude**: Exclude unwanted fields so they are not created in the new table
- **Rule Copying via getformrules**: Loads rules from `/api/form/getformrules` and remaps keys
- **Rules Safety Filtering**: Removes rule conditions/actions that reference excluded/uncreated fields

### v1.1.0 (November 2025)
- **Form Structure Comparison**: Interactive preview with visual indicators for included/excluded fields
- **Dynamic Field Validation**: Cross-references form fields against source table
- **Divider Support**: Full support for DIVIDER design elements alongside HTML elements
- **Professional UI Updates**: Improved color scheme for better readability and accessibility
- **Enhanced Exclusion Detection**: Identifies fields from related tables that won't be copied

### v1.0.0 (Initial Release)
- Initial release
- Table structure duplication
- Field mapping and transformation
- Form duplication with FormRules
- Intelligent exclusion of external dependencies
- Interactive field editor
- Technical mode with API testers

## Contributing

This tool is maintained for internal use within the GAB Platform. For issues or feature requests, please contact the development team.

## Security Notes

- User tokens are encrypted in localStorage using AES encryption
- Personal Access Tokens should be kept in `.github-credentials` (gitignored)
- Never commit credentials to the repository
- API calls use Bearer token authentication

## License

Internal use only - GAB Platform

---

**Developed for:** Internal Use  
**Platform:** GAB Platform  
**Last Updated:** December 2025


---

## Excel → Table Field Mapper (Data Validator)

### Overview

The **Excel → Table Field Mapper** (`gab_DataValidator.html`) is a web-based utility that helps you take an Excel spreadsheet and turn it into a **clean, import-safe CSV** aligned to a GAB table’s **FieldName tokens**, with optional **relationship lookups**, **database enrichment**, and **dropdown (ENUM/ENUM2) validation/fixes**.

This tool is designed for the common “Excel → GAB import” workflow where:
- File headers don’t exactly match the system’s field tokens
- Relationship fields require **IDs** (not human-friendly labels)
- ENUM/ENUM2 fields require values that exist in the dropdown list
- Some importers are strict about commas/quotes/newlines in CSV values

### Features

#### Core capabilities

- **Excel ingestion (SheetJS)**: reads `.xlsx/.xls`, supports multiple sheets, previews rows
- **Table selection** by Application Key: loads tables, then loads fields for the selected table
- **Mapping engine**: suggests column → field mappings using **name similarity** + **type compatibility**
- **Interactive mapping UI**:
  - Approve suggestions
  - Manually select a target field per column
  - Ignore columns (excluded from export)
  - Detect and block **duplicate mappings** (multiple columns mapped to the same FieldName) to prevent silent data loss
- **Relationship lookup rules (Crosswalk)**:
  - Convert file identifiers (e.g., “Project Number”) to the **record ID** needed by relationship fields
  - Uses reports (via `queryreport`) as the “lookup dataset”
  - Includes normalization modes for tricky names (ampersands, dashes, punctuation)
  - Includes a guarded **substring fallback** for cases like “PB&J Construction” containing “PB&J”
- **DB VLOOKUP enrichment**:
  - Look up existing database records and **append** columns like `<prefix>__db_id` and an optional extra field
  - Does not overwrite mapped fields
- **ENUM/ENUM2 validation and fixes**:
  - Loads dropdown values and reconciles file values using exact/normalized/abbreviation matching
  - “Find & Replace All” fixes per field
  - Optional: add new dropdown options directly to the system field definition (PUT `/api/Field`)
- **Export & import helpers**:
  - Download normalized CSV
  - Preview CSV (table view + raw snippet)
  - Optional: create records via `FormAction/postdata`
  - “Import-safe CSV mode”: strips problematic delimiters/quotes/newlines for naive importers
  - “Debug lookup mode”: keeps original identifiers and appends `__lookup_id` + `__lookup_status` columns
  - Debug XLSX export with 3 tabs: All / All lookups matched / Needs lookup

### Usage guide

#### Step 1 — Upload Excel
- Upload a `.xlsx` or `.xls` (click or drag/drop)
- Select the worksheet
- Choose **Header row** and **Data start row**
- Review the preview table (first ~10 rows)

#### Step 2 — Choose App + Table
- Enter **Application Key**
- Click **Load Tables** (uses `GET /api/applicationtable/getbyapplicationid?id={appKey}`)
- Select the target table (uses `GET /api/Field/getbytableid?id={tableKey}`)
- Optional: **Suggest Table** (heuristic based on sheet name + header/field similarity)

#### Step 3 — Map Columns → Fields
- Use **Auto-map** for a first pass
- Approve suggestions (or choose a different field)
- Ignore columns you don’t want exported/imported
- Ensure you have **no duplicate target field mappings** (export is blocked when duplicates exist)

#### Step 3a — Lookup Rules (Crosswalk) (Optional)
Add a lookup when a file column contains a human identifier, but the table field requires a record ID.

- Choose:
  - Source file column (identifier)
  - Target table field (often a relationship field token)
  - Parent table (where the identifier lives)
  - Report (used as lookup dataset)
  - Match column and Return column from the report sample
- Run **Validate Lookups** to see orphaned identifiers (provided but not matched)

#### Step 3b — DB VLOOKUP (Enrichment) (Optional)
Add enrichment when you want to append database values without changing your mapped export headers.

- Choose:
  - Source file column (identifier)
  - Parent table + report
  - Match column, ID column, and optional “return extra field”
  - Output prefix / output header

#### Step 4 — Export / Import
- **Preview CSV** to inspect output headers and sample rows
- **Download CSV** to generate the normalized artifact
- Optional: **Import via postdata** to create records in the selected table

### Technical architecture

#### Pipeline (conceptual)

```
Excel (.xlsx) → Parse Sheet → Infer Types → Suggest/Apply Mappings → Resolve Lookups/Enums → Build Normalized Rows → Export CSV / Import
```

#### Key state structures

- `columnToField`: Map(file column index → target FieldName token)
- `ignoredColumnIndexes`: Set(file columns excluded from export)
- `lookupRules`: Map(target FieldName → rule config)
- `lookupCaches`: reportId → cached rows + per-field lookup indexes
- `enrichRules`: list of enrichment rules that append output columns
- `dropdownValuesByFieldKey`: cached ENUM options + indexes (exact/normalized/abbrev)
- `enumValueFixesByFieldName`: per-field “Find & Replace All” overrides

#### Key functions

- **Excel + columns**: `readExcelFile`, `loadActiveSheet`, `computeColumns`, `inferColumnType`
- **Mapping**: `bestFieldMatchesForColumn`, `autoMap`
- **Reports/lookups**: `loadReportsForTableKey`, `queryReport`, `ensureLookupCachesBuilt`, `lookupSubstringFallback`
- **ENUM handling**: `loadDropdownValuesForFieldKeyCached`, `resolveEnumValueForField`, `addEnumOptionToField`, `addEnumOptionsToFieldBulk`
- **Export/import**: `buildNormalizedRows`, `downloadCsv`, `previewCsv`, `importViaPostdata`

### API endpoints used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/applicationtable/getbyapplicationid` | GET | Load tables for an application key |
| `/api/Field/getbytableid` | GET | Load fields for a table key |
| `/api/report/getreportbytableid` | GET | Load reports for a table (used for lookups/enrichment) |
| `/api/Report/queryreport` | POST | Query a report and use its rows as a lookup/enrichment dataset |
| `/api/Field/getdropdownvalues` | GET | Load allowed dropdown values for ENUM/ENUM2 fields |
| `/api/Field` | PUT | Update dropdown options (when “Add option” is used) |
| `/api/FormAction/postdata` | POST | (Optional) Create records from normalized rows |

### Configuration & environment notes

- **Auth**: decrypts a user token from `localStorage` using AES (same pattern as the duplicator tool).
- **API base**:
  - Production: `https://api.ignatius.io`
  - Local dev convenience: when running on `localhost`, API base becomes `/proxy` (you’d need a local proxy for that workflow).

### Known limitations / guardrails

- **Duplicate mappings are blocked**: if two columns map to the same FieldName, export is disabled until resolved.
- **Lookup accuracy depends on the report dataset**: if the report doesn’t contain the identifier, it will be flagged as orphaned.
- **Substring fallback is conservative by design**: helps with “A&B” / “Smith-Jones” cases while avoiding aggressive false-positive matching.
- **Import-safe CSV mode trades fidelity for safety**: strips commas/quotes/newlines to satisfy naive importers.
- **ENUM reconciliation depends on dropdown source of truth**: if dropdown values can’t be loaded, reconciliation degrades to pass-through.

### Best practices

#### Before exporting/importing
- Validate lookups (and enrichment) first to minimize orphaned relationship values.
- Preview CSV to confirm headers (FieldName tokens) and sample row conversions look correct.
- Keep Import-safe CSV mode enabled if your importer is strict about quoting/newlines.

#### Troubleshooting

- **Lookups show “missing/orphaned”**: verify report selection, match column, normalization mode, and that identifiers exist in the report.
- **Enums show “unmatched”**: use Fix Enum Values (Find & Replace All) or add options to the dropdown if appropriate.
- **Import via postdata fails**: enable Technical Mode and inspect console output for per-row failures.
