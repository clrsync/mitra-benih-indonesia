/**
 * ==============================================================================
 * MITRA BENIH INDONESIA - GOOGLE APPS SCRIPT BACKEND
 * ==============================================================================
 * This script serves as the API backend for your static website.
 * It uploads images to Google Drive and stores database records in Google Sheets.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet -> Click Extensions -> Apps Script.
 * 2. Paste this entire code into the code editor.
 * 3. Replace DRIVE_FOLDER_ID below with your Google Drive Folder ID.
 *    (Create a folder in Google Drive, open it, and copy the ID from the URL after /folders/...)
 * 4. Click 'Deploy' -> 'New deployment' -> Select type 'Web app'.
 * 5. Set 'Execute as': 'Me'
 * 6. Set 'Who has access': 'Anyone'
 * 7. Click 'Deploy', authorize access, and copy the Web App URL.
 * 8. Paste the Web App URL into app.js (GOOGLE_APPS_SCRIPT_URL).
 * ==============================================================================
 */

// Replace with your Google Drive Folder ID
var DRIVE_FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";

/**
 * Handle HTTP GET Requests (Read database from Google Sheets)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'FETCH_ALL';
    var responseData = {};

    if (action === 'FETCH_ALL' || action === 'FETCH_PRODUCTS') {
      responseData.products = getSheetRows(ss, 'Products');
    }
    if (action === 'FETCH_ALL' || action === 'FETCH_ACTIVITIES') {
      responseData.activities = getSheetRows(ss, 'Activities');
    }
    if (action === 'FETCH_ALL' || action === 'FETCH_TESTIMONIALS') {
      responseData.testimonials = getSheetRows(ss, 'Testimonials');
    }
    if (action === 'FETCH_ALL' || action === 'FETCH_CAREERS') {
      responseData.careers = getSheetRows(ss, 'Careers');
    }

    return createJsonResponse({ status: 'success', data: responseData });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Handle HTTP POST Requests (Upload images & append rows to Google Sheets)
 */
function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var payload = contents.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ADD_PRODUCT') {
      return handleAddProduct(ss, payload);
    } else if (action === 'ADD_ACTIVITY') {
      return handleAddActivity(ss, payload);
    } else if (action === 'ADD_TESTIMONIAL') {
      return handleAddTestimonial(ss, payload);
    } else if (action === 'ADD_ORDER') {
      return handleAddOrder(ss, payload);
    } else if (action === 'UPLOAD_IMAGE') {
      var imageUrl = uploadBase64ToDrive(payload.base64Data, payload.filename);
      return createJsonResponse({ status: 'success', imageUrl: imageUrl });
    } else {
      return createJsonResponse({ status: 'error', message: 'Unknown action: ' + action });
    }
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Helper: Upload Base64 Image to Google Drive
 */
function uploadBase64ToDrive(base64Data, filename) {
  if (!base64Data || !base64Data.startsWith('data:image')) {
    return base64Data || ""; // Return existing URL or empty string if not a new base64 upload
  }
  
  var parts = base64Data.split(';base64,');
  var contentType = parts[0].replace('data:', '');
  var decodedData = Utilities.base64Decode(parts[1]);
  var blob = Utilities.newBlob(decodedData, contentType, filename || ('upload_' + Date.now() + '.png'));

  var folder;
  if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID !== "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE") {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } else {
    folder = DriveApp.getRootFolder();
  }

  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // Return direct image view link
  return "https://lh3.googleusercontent.com/d/" + file.getId();
}

/**
 * Handler: Add Product to Google Sheet & Drive
 */
function handleAddProduct(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Products', ['ID', 'Name', 'Category', 'Price', 'Badge', 'ImageURL', 'Description', 'CreatedAt']);
  var imageUrl = payload.image ? uploadBase64ToDrive(payload.image, 'product_' + payload.id + '.png') : '';
  
  sheet.appendRow([
    payload.id || Date.now(),
    payload.name || '',
    payload.category || '',
    payload.price || 0,
    payload.badge || '',
    imageUrl,
    payload.description || '',
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Product added successfully', imageUrl: imageUrl });
}

/**
 * Handler: Add Activity to Google Sheet & Drive
 */
function handleAddActivity(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Activities', ['ID', 'Title', 'Date', 'ImageURL', 'Description', 'CreatedAt']);
  var imageUrl = payload.image ? uploadBase64ToDrive(payload.image, 'activity_' + payload.id + '.png') : '';

  sheet.appendRow([
    payload.id || Date.now(),
    payload.title || '',
    payload.date || '',
    imageUrl,
    payload.description || '',
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Activity added successfully', imageUrl: imageUrl });
}

/**
 * Handler: Add Testimonial to Google Sheet & Drive
 */
function handleAddTestimonial(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Testimonials', ['ID', 'Name', 'Role', 'AvatarURL', 'Text', 'Rating', 'CreatedAt']);
  var avatarUrl = payload.avatar ? uploadBase64ToDrive(payload.avatar, 'avatar_' + payload.id + '.png') : '';

  sheet.appendRow([
    payload.id || Date.now(),
    payload.name || '',
    payload.role || '',
    avatarUrl,
    payload.text || '',
    payload.rating || 5,
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Testimonial added successfully', avatarUrl: avatarUrl });
}

/**
 * Handler: Add Order Submission to Google Sheet
 */
function handleAddOrder(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Orders', ['OrderID', 'CustomerName', 'Phone', 'Address', 'Items', 'Total', 'CreatedAt']);

  sheet.appendRow([
    payload.orderId || ('ORD-' + Date.now()),
    payload.customerName || '',
    payload.phone || '',
    payload.address || '',
    JSON.stringify(payload.items || []),
    payload.total || 0,
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Order logged successfully' });
}

/**
 * Helper: Get or Create Sheet Tab with Headers
 */
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }
  return sheet;
}

/**
 * Helper: Get rows from sheet as array of objects
 */
function getSheetRows(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty

  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).toLowerCase();
      item[key] = row[j];
    }
    result.push(item);
  }
  return result;
}

/**
 * Helper: Output JSON response for Web App
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
