// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setDefaultDate();
    setupEventListeners();
    updateProgress();
    updateStats();
    
    // Initialize all textareas to auto-resize
    document.querySelectorAll('textarea').forEach(textarea => {
        autoResizeTextarea.call(textarea);
    });
});

// Set default audit date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const auditDateField = document.getElementById('auditDate');
    if (auditDateField) {
        auditDateField.value = today;
    }
}

// Setup event listeners for all form elements
function setupEventListeners() {
    const formElements = document.querySelectorAll('input, textarea');
    formElements.forEach(element => {
        element.addEventListener('change', function() {
            updateProgress();
            updateStats();
        });
        
        // Auto-resize textareas
        if (element.tagName === 'TEXTAREA') {
            element.addEventListener('input', autoResizeTextarea);
            // Set initial height
            autoResizeTextarea.call(element);
        }
    });
}

// Auto-resize textarea function
function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = Math.max(120, this.scrollHeight + 10) + 'px';
}

// Update progress bar
function updateProgress() {
    const radioGroups = document.querySelectorAll('input[type="radio"]');
    // Filter out the overall rating to get only assessment questions
    const assessmentGroups = [...new Set(Array.from(radioGroups)
        .filter(radio => radio.name !== 'overallRating')
        .map(radio => radio.name))];
    
    let completedGroups = 0;
    
    assessmentGroups.forEach(groupName => {
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        if (checkedRadio) completedGroups++;
    });
    
    const progressPercentage = assessmentGroups.length > 0 ? (completedGroups / assessmentGroups.length) * 100 : 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = progressPercentage + '%';
    }
    if (progressText) {
        progressText.textContent = Math.round(progressPercentage) + '%';
    }
}

// Update statistics
function updateStats() {
    const radioGroups = document.querySelectorAll('input[type="radio"]');
    // Filter out the overall rating to get only assessment questions
    const assessmentGroups = [...new Set(Array.from(radioGroups)
        .filter(radio => radio.name !== 'overallRating')
        .map(radio => radio.name))];
    
    let compliant = 0;
    let nonCompliant = 0;
    let na = 0;
    
    assessmentGroups.forEach(groupName => {
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        if (checkedRadio) {
            if (checkedRadio.value === 'yes') compliant++;
            else if (checkedRadio.value === 'no') nonCompliant++;
            else if (checkedRadio.value === 'na') na++;
        }
    });
    
    const assessedItems = assessmentGroups.length - na;
    const complianceRate = assessedItems > 0 ? Math.round((compliant / assessedItems) * 100) : 0;
    
    // Update DOM elements safely
    const totalItemsEl = document.getElementById('totalItems');
    const compliantItemsEl = document.getElementById('compliantItems');
    const nonCompliantItemsEl = document.getElementById('nonCompliantItems');
    const complianceRateEl = document.getElementById('complianceRate');
    
    if (totalItemsEl) totalItemsEl.textContent = assessmentGroups.length;
    if (compliantItemsEl) compliantItemsEl.textContent = compliant;
    if (nonCompliantItemsEl) nonCompliantItemsEl.textContent = nonCompliant;
    if (complianceRateEl) complianceRateEl.textContent = complianceRate + '%';
}

// Select overall rating
function selectRating(rating) {
    // Remove selected class from all options
    document.querySelectorAll('.rating-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }
    
    // Check the radio button
    const ratingInput = document.getElementById('rating_' + rating.replace('-', '_'));
    if (ratingInput) {
        ratingInput.checked = true;
    }
}

// Validate required fields
function validateForm() {
    const requiredFields = ['projectTitle', 'designer', 'auditorName', 'auditDate'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                field.style.borderColor = '#28a745';
            }
        }
    });
    
    return isValid;
}

// Collect all form data
function collectFormData() {
    const data = {};
    
    // Collect basic details
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], textarea');
    inputs.forEach(input => {
        const key = input.name || input.id;
        if (key) {
            data[key] = input.value;
        }
    });
    
    // Collect radio selections
    const radioGroups = document.querySelectorAll('input[type="radio"]');
    const groupNames = [...new Set(Array.from(radioGroups).map(radio => radio.name))];
    groupNames.forEach(groupName => {
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        data[groupName] = checkedRadio ? checkedRadio.value : '';
    });
    
    // Collect overall rating
    const ratingElement = document.querySelector('input[name="overallRating"]:checked');
    data.overallRating = ratingElement ? ratingElement.value : '';
    
    return data;
}

// Calculate detailed statistics
function calculateDetailedStats() {
    const radioGroups = document.querySelectorAll('input[type="radio"]');
    // Filter out the overall rating to get only assessment questions
    const assessmentGroups = [...new Set(Array.from(radioGroups)
        .filter(radio => radio.name !== 'overallRating')
        .map(radio => radio.name))];
    
    let compliant = 0;
    let nonCompliant = 0;
    let na = 0;
    
    assessmentGroups.forEach(groupName => {
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        if (checkedRadio) {
            if (checkedRadio.value === 'yes') compliant++;
            else if (checkedRadio.value === 'no') nonCompliant++;
            else if (checkedRadio.value === 'na') na++;
        }
    });
    
    const total = assessmentGroups.length;
    const assessedItems = total - na;
    const complianceRate = assessedItems > 0 ? Math.round((compliant / assessedItems) * 100) : 0;
    
    return { total, compliant, nonCompliant, na, complianceRate };
}

// Generate detailed assessment HTML for PDF report
function generateDetailedAssessmentHTML(data) {
    const assessmentCriteria = [
        { 
            key: 'reg9_1_1', 
            title: 'Hazard Elimination', 
            description: 'Designer has eliminated hazards through design so far as reasonably practicable' 
        },
        { 
            key: 'reg9_1_2', 
            title: 'Risk Reduction', 
            description: 'Designer has reduced risks from remaining hazards so far as reasonably practicable' 
        },
        { 
            key: 'reg9_1_3', 
            title: 'Hierarchy of Control', 
            description: 'Designer has given collective measures priority over individual measures' 
        },
        { 
            key: 'reg9_2_1', 
            title: 'Residual Risk Information', 
            description: 'Information about significant residual risks is provided' 
        },
        { 
            key: 'reg9_2_2', 
            title: 'Construction Work Information', 
            description: 'Information relates to construction work activities and risks' 
        },
        { 
            key: 'reg9_2_3', 
            title: 'Maintenance Work Information', 
            description: 'Information relates to maintenance work activities and risks' 
        },
        { 
            key: 'admin_1', 
            title: 'Client Duties Awareness', 
            description: 'Designer demonstrates understanding of client duties under CDM 2015' 
        },
        { 
            key: 'admin_2', 
            title: 'Pre-Construction Information Receipt', 
            description: 'Designer has received and utilized relevant pre-construction information' 
        },
        { 
            key: 'admin_3', 
            title: 'Information Circulation', 
            description: 'Designer has appropriate systems for circulating health and safety information' 
        },
        { 
            key: 'admin_4', 
            title: 'Competence and Resources', 
            description: 'Designer has demonstrated adequate competence and resources for health and safety' 
        },
        { 
            key: 'admin_5', 
            title: 'Coordination with Other Designers', 
            description: 'Designer has effective arrangements for coordination with other designers' 
        }
    ];
    
    let html = '<table class="assessment-table"><thead><tr><th style="width:25%">Assessment Criteria</th><th style="width:10%">Status</th><th style="width:35%">Evidence/Comments</th><th style="width:30%">Actions Required</th></tr></thead><tbody>';
    
    assessmentCriteria.forEach(criteria => {
        const status = data[criteria.key] || '';
        const statusClass = status === 'yes' ? 'compliant' : status === 'no' ? 'non-compliant' : 'na';
        const statusText = status === 'yes' ? 'COMPLIANT' : status === 'no' ? 'NON-COMPLIANT' : status === 'na' ? 'N/A' : 'NOT ASSESSED';
        const comments = data[criteria.key + '_comments'] || 'No comments provided';
        const actions = data[criteria.key + '_action'] || 'No actions specified';
        
        html += `
            <tr>
                <td><strong>${criteria.title}</strong><br><em>${criteria.description}</em></td>
                <td class="${statusClass}">${statusText}</td>
                <td>${escapeHtml(comments)}</td>
                <td>${escapeHtml(actions)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    return html;
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get compliance class for styling
function getComplianceClass(rating) {
    if (rating === 'compliant') return 'compliant';
    if (rating === 'non-compliant' || rating === 'major') return 'non-compliant';
    return 'na';
}

// Format rating for display
function formatRating(rating) {
    const ratings = {
        'compliant': 'FULLY COMPLIANT',
        'minor': 'MINOR NON-COMPLIANCE',
        'major': 'MAJOR NON-COMPLIANCE',
        'non-compliant': 'NON-COMPLIANT'
    };
    return ratings[rating] || 'NOT ASSESSED';
}

// Generate PDF report
function generatePDFReport() {
    if (!validateForm()) {
        alert('Please complete all required fields (marked with *) before generating the report.');
        return;
    }
    
    const data = collectFormData();
    const stats = calculateDetailedStats();
    
    const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>CDM 2015 Audit Report - ${escapeHtml(data.projectTitle || 'Untitled')}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    line-height: 1.6; 
                    color: #333;
                    background: #f5f5f5;
                }
                .header { 
                    background: rgb(51, 51, 51); 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 30px;
                }
                .header-logo-left,
                .header-logo-right {
                    width: 60px;
                    height: 60px;
                    object-fit: contain;
                    flex-shrink: 0;
                    filter: brightness(0) invert(1);
                }
                .header-content {
                    flex: 1;
                    text-align: center;
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                    font-weight: bold;
                }
                .header p {
                    margin: 5px 0 0 0;
                    font-size: 14px;
                }
                .summary-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0; 
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .summary-table th { 
                    background: rgb(51, 51, 51); 
                    color: white; 
                    padding: 15px; 
                    text-align: left; 
                    font-weight: bold;
                }
                .summary-table td { 
                    padding: 15px; 
                    border-bottom: 1px solid #e0e0e0; 
                }
                .summary-table tr:nth-child(even) { 
                    background: #f8f9fa; 
                }
                .assessment-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0; 
                    font-size: 12px; 
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .assessment-table th { 
                    background: rgb(51, 51, 51); 
                    color: white; 
                    padding: 12px; 
                    text-align: left; 
                    font-weight: bold;
                }
                .assessment-table td { 
                    padding: 12px; 
                    border-bottom: 1px solid #e0e0e0; 
                    vertical-align: top; 
                }
                .assessment-table tr:nth-child(even) { 
                    background: #f8f9fa; 
                }
                .compliant { 
                    color: #28a745; 
                    font-weight: bold; 
                }
                .non-compliant { 
                    color: #dc3545; 
                    font-weight: bold; 
                }
                .na { 
                    color: #6c757d; 
                    font-weight: bold; 
                }
                h2 { 
                    color: rgb(51, 51, 51); 
                    border-bottom: 2px solid #e0e0e0; 
                    padding-bottom: 5px; 
                    margin-top: 30px;
                    font-size: 1.4em;
                }
                h3 { 
                    color: #515151; 
                    margin-top: 25px; 
                    font-size: 1.2em;
                    border-bottom: 2px solid #e0e0e0;
                    padding-bottom: 5px;
                }
                .comments-box { 
                    background: #fafafa; 
                    border-left: 4px solid #2a5298; 
                    padding: 15px; 
                    margin: 10px 0; 
                    border-radius: 8px;
                }
                .footer { 
                    margin-top: 40px; 
                    padding-top: 20px; 
                    border-top: 2px solid #e0e0e0; 
                    text-align: center; 
                    color: #666; 
                    background: #fafafa;
                    padding: 20px;
                    border-radius: 8px;
                }
                .section-divider {
                    background: #fafafa;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                    border-left: 4px solid #2a5298;
                }
                @media print { 
                    body { 
                        margin: 0; 
                        background: white !important;
                    } 
                    .header { 
                        background: rgb(51, 51, 51) !important; 
                        color: white !important; 
                    }
                    .header-logo-left,
                    .header-logo-right {
                        filter: brightness(0) invert(1) !important;
                    }
                    .summary-table th,
                    .assessment-table th {
                        background: rgb(51, 51, 51) !important;
                        color: white !important;
                    }
                    table { 
                        page-break-inside: avoid; 
                    }
                    .section-divider {
                        background: #fafafa !important;
                        border-left: 4px solid #2a5298 !important;
                    }
                    .comments-box {
                        background: #fafafa !important;
                        border-left: 4px solid #2a5298 !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="logo.png" alt="Archer Health and Safety" class="header-logo-left">
                <div class="header-content">
                    <h1>CDM 2015 REGULATION 9 DESIGN RISK ASSESSMENT AUDIT REPORT</h1>
                    <p>Reference: HSE L153 Managing health and safety in construction</p>
                </div>
                <img src="logo.png" alt="Archer Health and Safety" class="header-logo-right">
            </div>
            
            <div class="section-divider">
                <h2>EXECUTIVE SUMMARY</h2>
                <table class="summary-table">
                    <tr><td><strong>Project Title:</strong></td><td>${escapeHtml(data.projectTitle || 'N/A')}</td></tr>
                    <tr><td><strong>Project Reference:</strong></td><td>${escapeHtml(data.projectRef || 'N/A')}</td></tr>
                    <tr><td><strong>Designer/Organisation:</strong></td><td>${escapeHtml(data.designer || 'N/A')}</td></tr>
                    <tr><td><strong>Document Reference:</strong></td><td>${escapeHtml(data.docRef || 'N/A')}</td></tr>
                    <tr><td><strong>Auditor:</strong></td><td>${escapeHtml(data.auditorName || 'N/A')}</td></tr>
                    <tr><td><strong>Audit Date:</strong></td><td>${escapeHtml(data.auditDate || 'N/A')}</td></tr>
                    <tr><td><strong>Overall Rating:</strong></td><td class="${getComplianceClass(data.overallRating)}">${formatRating(data.overallRating)}</td></tr>
                </table>
            </div>
            
            <div class="section-divider">
                <h2>COMPLIANCE STATISTICS</h2>
                <table class="summary-table">
                    <tr><td><strong>Total Items Assessed:</strong></td><td>${stats.total}</td></tr>
                    <tr><td><strong>Compliant Items:</strong></td><td class="compliant">${stats.compliant}</td></tr>
                    <tr><td><strong>Non-Compliant Items:</strong></td><td class="non-compliant">${stats.nonCompliant}</td></tr>
                    <tr><td><strong>Not Applicable Items:</strong></td><td class="na">${stats.na}</td></tr>
                    <tr><td><strong>Compliance Rate:</strong></td><td><strong>${stats.complianceRate}%</strong></td></tr>
                </table>
            </div>
            
            <div class="section-divider">
                <h2>DETAILED ASSESSMENT RESULTS</h2>
                ${generateDetailedAssessmentHTML(data)}
            </div>
            
            <div class="section-divider">
                <h2>AUDIT FINDINGS</h2>
                <h3>Key Strengths Identified</h3>
                <div class="comments-box">${escapeHtml(data.strengths || 'None specified')}</div>
                
                <h3>Areas for Improvement</h3>
                <div class="comments-box">${escapeHtml(data.improvements || 'None specified')}</div>
                
                <h3>Critical Actions Required</h3>
                <div class="comments-box">${escapeHtml(data.criticalActions || 'None specified')}</div>
            </div>
            
            <div class="footer">
                <p><strong>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</strong></p>
                <p>This audit was conducted in accordance with CDM 2015 Regulations and HSE L153 Guidance</p>
            </div>
        </body>
        </html>
    `;
    
    // Open in new window for PDF generation
    const reportWindow = window.open('', '_blank', 'width=800,height=600');
    if (reportWindow) {
        reportWindow.document.write(reportHTML);
        reportWindow.document.close();
        
        // Auto-print after content loads
        setTimeout(() => {
            reportWindow.print();
        }, 1000);
    } else {
        alert('Please allow pop-ups to generate the PDF report.');
    }
}

// Save form data as JSON
function saveForm() {
    const data = collectFormData();
    data.savedAt = new Date().toISOString();
    
    try {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cdm_audit_${(data.projectTitle || 'form').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Form data saved successfully!');
    } catch (error) {
        alert('Error saving form: ' + error.message);
    }
}

// Import form data from JSON file
function importForm() {
    const fileInput = document.getElementById('importFile');
    fileInput.click();
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
        alert('Please select a valid JSON file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            loadFormData(data);
            alert('Form data imported successfully!');
        } catch (error) {
            alert('Error importing form data: Invalid JSON file format.');
        }
    };
    reader.readAsText(file);
    
    // Clear the file input so the same file can be imported again if needed
    event.target.value = '';
}

// Load form data into the form
function loadFormData(data) {
    // Load text inputs and textareas
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], textarea');
    inputs.forEach(input => {
        const key = input.name || input.id;
        if (key && data[key]) {
            input.value = data[key];
            // Trigger auto-resize for textareas
            if (input.tagName === 'TEXTAREA') {
                autoResizeTextarea.call(input);
            }
        }
    });
    
    // Load radio button selections
    const radioGroups = document.querySelectorAll('input[type="radio"]');
    const groupNames = [...new Set(Array.from(radioGroups).map(radio => radio.name))];
    groupNames.forEach(groupName => {
        if (data[groupName]) {
            const radioButton = document.querySelector(`input[name="${groupName}"][value="${data[groupName]}"]`);
            if (radioButton) {
                radioButton.checked = true;
                
                // Handle overall rating selection visual update
                if (groupName === 'overallRating') {
                    const ratingOption = radioButton.closest('.rating-option');
                    if (ratingOption) {
                        // Remove selected class from all rating options
                        document.querySelectorAll('.rating-option').forEach(option => {
                            option.classList.remove('selected');
                        });
                        // Add selected class to the current option
                        ratingOption.classList.add('selected');
                    }
                }
            }
        }
    });
    
    // Update progress and statistics
    updateProgress();
    updateStats();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                saveForm();
                break;
            case 'o':
                e.preventDefault();
                importForm();
                break;
        }
    }
});