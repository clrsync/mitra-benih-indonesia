/**
 * ==============================================================================
 * MITRA BENIH INDONESIA - FULL GOOGLE APPS SCRIPT BACKEND (BULLETPROOF ENGINE)
 * ==============================================================================
 * This script handles full CRUD (Create, Read, Update, Delete) operations for
 * Products, Activities, Testimonials, Careers, Videos, and Orders.
 * Images are backed up to Google Drive and served reliably via Google Sheets.
 * ==============================================================================
 */

// Replace with your Google Drive Folder ID
var DRIVE_FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";

/**
 * Handle HTTP GET Requests (Read data from Google Sheets)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    seedInitialData(ss);
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
    if (action === 'FETCH_ALL' || action === 'FETCH_DIVISIONS') {
      responseData.divisions = getSheetRows(ss, 'Divisions');
    }
    if (action === 'FETCH_ALL' || action === 'FETCH_VIDEOS') {
      responseData.videos = getSheetRows(ss, 'Videos');
    }

    return createJsonResponse({ status: 'success', data: responseData });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Handle HTTP POST Requests (Create, Update, Delete operations)
 */
function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var payload = contents.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // PRODUCTS
    if (action === 'ADD_PRODUCT') {
      return handleAddProduct(ss, payload);
    } else if (action === 'UPDATE_PRODUCT') {
      return handleUpdateProduct(ss, payload);
    } else if (action === 'DELETE_PRODUCT') {
      return handleDeleteRow(ss, 'Products', payload.id);
    }
    
    // ACTIVITIES
    else if (action === 'ADD_ACTIVITY') {
      return handleAddActivity(ss, payload);
    } else if (action === 'UPDATE_ACTIVITY') {
      return handleUpdateActivity(ss, payload);
    } else if (action === 'DELETE_ACTIVITY') {
      return handleDeleteRow(ss, 'Activities', payload.id);
    }
    
    // TESTIMONIALS
    else if (action === 'ADD_TESTIMONIAL') {
      return handleAddTestimonial(ss, payload);
    } else if (action === 'UPDATE_TESTIMONIAL') {
      return handleUpdateTestimonial(ss, payload);
    } else if (action === 'DELETE_TESTIMONIAL') {
      return handleDeleteRow(ss, 'Testimonials', payload.id);
    }
    
    // CAREERS
    else if (action === 'ADD_CAREER') {
      return handleAddCareer(ss, payload);
    } else if (action === 'UPDATE_CAREER') {
      return handleUpdateCareer(ss, payload);
    } else if (action === 'DELETE_CAREER') {
      return handleDeleteRow(ss, 'Careers', payload.id);
    }

    // DIVISIONS
    else if (action === 'ADD_DIVISION') {
      return handleAddDivision(ss, payload);
    } else if (action === 'DELETE_DIVISION') {
      return handleDeleteRow(ss, 'Divisions', payload.id);
    }

    // VIDEOS
    else if (action === 'ADD_VIDEO') {
      return handleAddVideo(ss, payload);
    } else if (action === 'UPDATE_VIDEO') {
      return handleUpdateVideo(ss, payload);
    } else if (action === 'DELETE_VIDEO') {
      return handleDeleteRow(ss, 'Videos', payload.id);
    }
    
    // ORDERS
    else if (action === 'ADD_ORDER') {
      return handleAddOrder(ss, payload);
    } 
    
    // DIRECT IMAGE UPLOAD ONLY
    else if (action === 'UPLOAD_IMAGE') {
      var imageUrl = processImageStorage(payload.base64Data, payload.filename);
      return createJsonResponse({ status: 'success', imageUrl: imageUrl });
    } else {
      return createJsonResponse({ status: 'error', message: 'Unknown action: ' + action });
    }
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Helper: Save Image to Google Drive for Backup & Return Reliable Image Data
 */
function processImageStorage(base64Data, filename) {
  if (!base64Data) return "";
  
  if (base64Data.startsWith('data:image')) {
    try {
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
      return "https://lh3.googleusercontent.com/d/" + file.getId();
    } catch (e) {
      Logger.log("Drive backup warning: " + e.toString());
    }
  }
  
  return base64Data;
}

/**
 * Handler: Add Product
 */
function handleAddProduct(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Products', ['ID', 'Name', 'Category', 'Price', 'Badge', 'ImageURL', 'Description', 'Instruction', 'CreatedAt']);
  var imageUrl = processImageStorage(payload.image, 'product_' + payload.id + '.png');
  
  sheet.appendRow([
    payload.id || Date.now(),
    payload.name || '',
    payload.category || '',
    payload.price || 0,
    payload.badge || '',
    imageUrl,
    payload.description || '',
    payload.instruction || '',
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Product added successfully', imageUrl: imageUrl });
}

/**
 * Handler: Update Product by ID
 */
function handleUpdateProduct(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Products', ['ID', 'Name', 'Category', 'Price', 'Badge', 'ImageURL', 'Description', 'Instruction', 'CreatedAt']);
  var data = sheet.getDataRange().getValues();
  var targetId = String(payload.id);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === targetId) {
      var existingImageUrl = data[i][5];
      var finalImageUrl = payload.image ? processImageStorage(payload.image, 'product_' + targetId + '.png') : existingImageUrl;

      sheet.getRange(i + 1, 2).setValue(payload.name || data[i][1]);
      sheet.getRange(i + 1, 3).setValue(payload.category || data[i][2]);
      sheet.getRange(i + 1, 4).setValue(payload.price !== undefined ? payload.price : data[i][3]);
      sheet.getRange(i + 1, 5).setValue(payload.badge !== undefined ? payload.badge : data[i][4]);
      sheet.getRange(i + 1, 6).setValue(finalImageUrl);
      sheet.getRange(i + 1, 7).setValue(payload.description || data[i][6]);
      sheet.getRange(i + 1, 8).setValue(payload.instruction || data[i][7]);

      return createJsonResponse({ status: 'success', message: 'Product updated successfully', imageUrl: finalImageUrl });
    }
  }
  return createJsonResponse({ status: 'error', message: 'Product not found with ID: ' + targetId });
}

/**
 * Handler: Add Activity
 */
function handleAddActivity(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Activities', ['ID', 'Title', 'Date', 'ImageURL', 'Description', 'CreatedAt']);
  var imageUrl = processImageStorage(payload.image, 'activity_' + payload.id + '.png');

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
 * Handler: Update Activity by ID
 */
function handleUpdateActivity(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Activities', ['ID', 'Title', 'Date', 'ImageURL', 'Description', 'CreatedAt']);
  var data = sheet.getDataRange().getValues();
  var targetId = String(payload.id);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === targetId) {
      var existingImageUrl = data[i][3];
      var finalImageUrl = payload.image ? processImageStorage(payload.image, 'activity_' + targetId + '.png') : existingImageUrl;

      sheet.getRange(i + 1, 2).setValue(payload.title || data[i][1]);
      sheet.getRange(i + 1, 3).setValue(payload.date || data[i][2]);
      sheet.getRange(i + 1, 4).setValue(finalImageUrl);
      sheet.getRange(i + 1, 5).setValue(payload.description || data[i][4]);

      return createJsonResponse({ status: 'success', message: 'Activity updated successfully', imageUrl: finalImageUrl });
    }
  }
  return createJsonResponse({ status: 'error', message: 'Activity not found with ID: ' + targetId });
}

/**
 * Handler: Add Testimonial
 */
function handleAddTestimonial(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Testimonials', ['ID', 'Name', 'Role', 'AvatarURL', 'Text', 'Rating', 'CreatedAt']);
  var avatarUrl = processImageStorage(payload.avatar, 'avatar_' + payload.id + '.png');

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
 * Handler: Update Testimonial by ID
 */
function handleUpdateTestimonial(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Testimonials', ['ID', 'Name', 'Role', 'AvatarURL', 'Text', 'Rating', 'CreatedAt']);
  var data = sheet.getDataRange().getValues();
  var targetId = String(payload.id);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === targetId) {
      var existingAvatarUrl = data[i][3];
      var finalAvatarUrl = payload.avatar ? processImageStorage(payload.avatar, 'avatar_' + targetId + '.png') : existingAvatarUrl;

      sheet.getRange(i + 1, 2).setValue(payload.name || data[i][1]);
      sheet.getRange(i + 1, 3).setValue(payload.role || data[i][2]);
      sheet.getRange(i + 1, 4).setValue(finalAvatarUrl);
      sheet.getRange(i + 1, 5).setValue(payload.text || data[i][4]);
      sheet.getRange(i + 1, 6).setValue(payload.rating !== undefined ? payload.rating : data[i][5]);

      return createJsonResponse({ status: 'success', message: 'Testimonial updated successfully', avatarUrl: finalAvatarUrl });
    }
  }
  return createJsonResponse({ status: 'error', message: 'Testimonial not found with ID: ' + targetId });
}

/**
 * Handler: Add Career Opening
 */
function handleAddCareer(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Careers', ['ID', 'Title', 'Division', 'DivisionLabel', 'Type', 'Date', 'Status', 'Description', 'Requirements', 'CreatedAt']);
  var reqStr = Array.isArray(payload.requirements) ? payload.requirements.join('\n') : (payload.requirements || '');

  sheet.appendRow([
    payload.id || Date.now(),
    payload.title || '',
    payload.division || '',
    payload.divisionLabel || '',
    payload.type || '',
    payload.date || '',
    payload.status || 'active',
    payload.description || '',
    reqStr,
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Career opening added successfully' });
}

/**
 * Handler: Update Career Opening by ID
 */
function handleUpdateCareer(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Careers', ['ID', 'Title', 'Division', 'DivisionLabel', 'Type', 'Date', 'Status', 'Description', 'Requirements', 'CreatedAt']);
  var data = sheet.getDataRange().getValues();
  var targetId = String(payload.id);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === targetId) {
      var reqStr = Array.isArray(payload.requirements) ? payload.requirements.join('\n') : (payload.requirements || data[i][8]);
      sheet.getRange(i + 1, 2).setValue(payload.title || data[i][1]);
      sheet.getRange(i + 1, 3).setValue(payload.division || data[i][2]);
      sheet.getRange(i + 1, 4).setValue(payload.divisionLabel || data[i][3]);
      sheet.getRange(i + 1, 5).setValue(payload.type || data[i][4]);
      sheet.getRange(i + 1, 6).setValue(payload.date || data[i][5]);
      sheet.getRange(i + 1, 7).setValue(payload.status || data[i][6]);
      sheet.getRange(i + 1, 8).setValue(payload.description || data[i][7]);
      sheet.getRange(i + 1, 9).setValue(reqStr);

      return createJsonResponse({ status: 'success', message: 'Career updated successfully' });
    }
  }
  return createJsonResponse({ status: 'error', message: 'Career not found with ID: ' + targetId });
}

/**
 * Handler: Add Video Embed
 */
function handleAddVideo(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Videos', ['ID', 'Title', 'Category', 'CategoryLabel', 'Url', 'Type', 'Description', 'CreatedAt']);

  sheet.appendRow([
    payload.id || Date.now(),
    payload.title || '',
    payload.category || '',
    payload.categoryLabel || '',
    payload.url || '',
    payload.type || 'iframe',
    payload.description || '',
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Video added successfully' });
}

/**
 * Handler: Update Video by ID
 */
function handleUpdateVideo(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Videos', ['ID', 'Title', 'Category', 'CategoryLabel', 'Url', 'Type', 'Description', 'CreatedAt']);
  var data = sheet.getDataRange().getValues();
  var targetId = String(payload.id);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === targetId) {
      sheet.getRange(i + 1, 2).setValue(payload.title || data[i][1]);
      sheet.getRange(i + 1, 3).setValue(payload.category || data[i][2]);
      sheet.getRange(i + 1, 4).setValue(payload.categoryLabel || data[i][3]);
      sheet.getRange(i + 1, 5).setValue(payload.url || data[i][4]);
      sheet.getRange(i + 1, 6).setValue(payload.type || data[i][5]);
      sheet.getRange(i + 1, 7).setValue(payload.description || data[i][6]);

      return createJsonResponse({ status: 'success', message: 'Video updated successfully' });
    }
  }
  return createJsonResponse({ status: 'error', message: 'Video not found with ID: ' + targetId });
}

/**
 * Handler: Add Division Master
 */
function handleAddDivision(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Divisions', ['ID', 'Label', 'CreatedAt']);
  var divId = payload.id || (payload.label || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  sheet.appendRow([
    divId,
    payload.label || '',
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Division added successfully', id: divId });
}

/**
 * Helper: Seed Initial Divisions & Careers if Sheets are Empty
 */
function seedInitialData(ss) {
  try {
    // Seed Divisions
    var divSheet = getOrCreateSheet(ss, 'Divisions', ['ID', 'Label', 'CreatedAt']);
    if (divSheet.getLastRow() <= 1) {
      var defaultDivs = [
        ['marketing', 'MARKETING', new Date().toISOString()],
        ['keuangan', 'KEUANGAN', new Date().toISOString()],
        ['kebun', 'KEBUN', new Date().toISOString()],
        ['pt-mbi', 'PT MBI', new Date().toISOString()]
      ];
      for (var d = 0; d < defaultDivs.length; d++) {
        divSheet.appendRow(defaultDivs[d]);
      }
    }

    // Seed Careers
    var careerSheet = getOrCreateSheet(ss, 'Careers', ['ID', 'Title', 'Division', 'DivisionLabel', 'Type', 'Date', 'Status', 'Description', 'Requirements', 'CreatedAt']);
    if (careerSheet.getLastRow() <= 1) {
      var defaultCareers = [
        [
          1,
          'BUSINESS DEVELOPMENT',
          'marketing',
          'MARKETING',
          'BUSINESS DEVELOPMENT',
          '01 Juli 2026',
          'active',
          'Mencari individu yang kompeten untuk mengembangkan kemitraan bisnis benih tanaman di berbagai wilayah Indonesia.',
          "Pendidikan minimal D3/S1 Pemasaran, Agribisnis, atau bidang relevan.\nPengalaman kerja minimal 1-2 tahun di bidang penjualan/business development.\nMemiliki kemampuan negosiasi dan komunikasi yang sangat baik.\nSiap melakukan perjalanan dinas untuk perluasan area distribusi.",
          new Date().toISOString()
        ],
        [
          2,
          'TECHNICAL ASSISTANT',
          'marketing',
          'MARKETING',
          'TECHNICAL ASSISTANT',
          '01 Juli 2026',
          'active',
          'Membantu tim pemasaran dalam memberikan konsultasi teknis budidaya tanaman kepada calon pembeli.',
          "Pendidikan D3/S1 Agroteknologi, Agronomi, atau bidang pertanian sejenis.\nMemahami teknik budidaya bibit buah-buahan, benih sayur, dan pemupukan modern.\nMampu membuat materi edukasi budidaya.\nRamah, sabar, dan memiliki kemampuan pelayanan konsumen yang baik.",
          new Date().toISOString()
        ],
        [
          3,
          'STAF KEUANGAN & ADMINISTRASI',
          'keuangan',
          'KEUANGAN',
          'FINANCE & ADMIN',
          '02 Juli 2026',
          'active',
          'Mengelola pembukuan, transaksi penjualan harian, dan administrasi pengiriman bibit tanaman.',
          "Pendidikan minimal SMK/D3 Akuntansi atau Keuangan.\nMenguasai aplikasi spreadsheet (MS Excel/Google Sheets).\nTeliti, jujur, bertanggung jawab, dan terbiasa dengan tenggat waktu.\nMemahami administrasi logistik/ekspedisi pengiriman barang.",
          new Date().toISOString()
        ],
        [
          4,
          'OPERASIONAL NURSERY (KEBUN)',
          'kebun',
          'KEBUN',
          'NURSERY OPERATIONS',
          '03 Juli 2026',
          'active',
          'Bertanggung jawab dalam perawatan tanaman, penyiraman, okulasi, dan pemeliharaan stok bibit di kebun pembibitan.',
          "Pendidikan minimal SMK Pertanian atau memiliki pengalaman budidaya tanaman.\nMenguasai teknik perbanyakan tanaman (okulasi, sambung pucuk, stek).\nFisik kuat, jujur, menyukai pekerjaan lapangan/kebun.\nSiap ditempatkan di kebun pembibitan Sleman, Yogyakarta.",
          new Date().toISOString()
        ],
        [
          5,
          'DIGITAL MARKETING SPECIALIST',
          'marketing',
          'MARKETING',
          'DIGITAL MARKETING',
          '04 Juli 2026',
          'active',
          'Mengelola media sosial, membuat konten video edukasi tanaman, dan menjalankan iklan digital untuk meningkatkan penjualan benih.',
          "Pendidikan minimal D3/S1 Ilmu Komunikasi, Pemasaran Digital, atau Desain Grafis.\nMenguasai tools editing video/foto (CapCut, Canva, Photoshop).\nMemahami cara kerja media sosial dan optimasi SEO/SEM.\nMemiliki ketertarikan tinggi di dunia tanaman/berkebun.",
          new Date().toISOString()
        ]
      ];
      for (var c = 0; c < defaultCareers.length; c++) {
        careerSheet.appendRow(defaultCareers[c]);
      }
    }
  } catch (err) {
    Logger.log("Seed initial data warning: " + err.toString());
  }
}

/**
 * Handler: Add Order Log
 */
function handleAddOrder(ss, payload) {
  var sheet = getOrCreateSheet(ss, 'Orders', ['OrderID', 'CustomerName', 'Phone', 'Address', 'Courier', 'Items', 'Total', 'CreatedAt']);

  sheet.appendRow([
    payload.orderId || ('ORD-' + Date.now()),
    payload.customerName || '',
    payload.phone || '',
    payload.address || '',
    payload.courier || '',
    JSON.stringify(payload.items || []),
    payload.total || 0,
    new Date().toISOString()
  ]);

  return createJsonResponse({ status: 'success', message: 'Order logged successfully' });
}

/**
 * Generic Helper: Delete Row by ID
 */
function handleDeleteRow(ss, sheetName, id) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createJsonResponse({ status: 'error', message: 'Sheet not found: ' + sheetName });

  var data = sheet.getDataRange().getValues();
  var targetId = String(id);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === targetId) {
      sheet.deleteRow(i + 1);
      return createJsonResponse({ status: 'success', message: 'Deleted record ID: ' + targetId + ' from ' + sheetName });
    }
  }

  return createJsonResponse({ status: 'error', message: 'Record not found with ID: ' + targetId });
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
