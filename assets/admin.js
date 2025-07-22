(function () {
    function serializeTable() {
        var rows = document.querySelectorAll('#fdm-table tbody tr');
        var map = {};
        var errors = [];
        var seen = {};
        
        // Clear previous error states
        document.querySelectorAll('.fdm-host, .fdm-port, .fdm-ip').forEach(function(input) {
            input.classList.remove('error');
        });
        
        rows.forEach(function (row, idx) {
            var hostInput = row.querySelector('.fdm-host');
            var portInput = row.querySelector('.fdm-port');
            var ipInput = row.querySelector('.fdm-ip');
            
            var host = hostInput.value.trim();
            var port = portInput.value.trim();
            var ip = ipInput.value.trim();
            
            var hasError = false;
            
            if (!host) {
                errors.push(fdmVars.rowText + ' ' + (idx + 1) + ': ' + fdmVars.domainMissingText);
                hostInput.classList.add('error');
                hasError = true;
            }
            
            if (!port || isNaN(port) || port < 1 || port > 65535) {
                errors.push(fdmVars.rowText + ' ' + (idx + 1) + ': ' + fdmVars.invalidPortText);
                portInput.classList.add('error');
                hasError = true;
            }
            
            if (!/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/.test(ip) && !/^([a-fA-F0-9:]+)$/.test(ip)) {
                errors.push(fdmVars.rowText + ' ' + (idx + 1) + ': ' + fdmVars.invalidIpText);
                ipInput.classList.add('error');
                hasError = true;
            }
            
            var key = host + ':' + port;
            if (seen[key] && !hasError) {
                errors.push(fdmVars.rowText + ' ' + (idx + 1) + ': ' + fdmVars.duplicateText);
                hostInput.classList.add('error');
                portInput.classList.add('error');
            }
            
            seen[key] = true;
            if (!hasError) {
                map[key] = ip;
            }
        });
        
        return { json: JSON.stringify(map), errors: errors };
    }
    
    function updateHiddenField() {
        var result = serializeTable();
        document.getElementById('fdm_hosts_mapping').value = result.json;
        var errDiv = document.getElementById('fdm-error');
        if (result.errors.length) {
            errDiv.innerHTML = result.errors.join('<br>');
            errDiv.style.display = 'block';
        } else {
            errDiv.innerHTML = '';
            errDiv.style.display = 'none';
        }
    }
    
    function addNewRow() {
        var tr = document.createElement('tr');
        tr.className = 'new-row';
        tr.innerHTML = '<td><input type="text" class="fdm-host" placeholder="example.com" /></td>' +
            '<td><input type="number" class="fdm-port" min="1" max="65535" value="443" placeholder="443" /></td>' +
            '<td><input type="text" class="fdm-ip" placeholder="192.168.1.1" /></td>' +
            '<td><span class="fdm-remove-row" title="' + fdmVars.removeText + '">&times;</span></td>';
        document.querySelector('#fdm-table tbody').appendChild(tr);
        
        // Focus on the first input of the new row
        tr.querySelector('.fdm-host').focus();
        
        // Remove animation class after animation completes
        setTimeout(function() {
            tr.classList.remove('new-row');
        }, 300);
        
        updateHiddenField();
    }
    
    function initDarkMode() {
        var darkModeToggle = document.getElementById('fdm-dark-mode-toggle');
        var body = document.body;
        
        // Check for saved dark mode preference
        var isDarkMode = localStorage.getItem('fdm-dark-mode') === 'true';
        if (isDarkMode) {
            body.classList.add('fdm-dark-mode');
            darkModeToggle.innerHTML = '<span class="fdm-light-icon">☀️</span>';
        }
        
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('fdm-dark-mode');
            var isDark = body.classList.contains('fdm-dark-mode');
            localStorage.setItem('fdm-dark-mode', isDark);
            darkModeToggle.innerHTML = isDark ? '<span class="fdm-light-icon">☀️</span>' : '<span class="fdm-dark-icon">🌙</span>';
        });
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize dark mode
        initDarkMode();
        
        // Add row button
        document.querySelector('.fdm-add-row').addEventListener('click', addNewRow);
        
        // Table event listeners
        var table = document.querySelector('#fdm-table');
        table.addEventListener('input', updateHiddenField);
        table.addEventListener('change', updateHiddenField);
        table.addEventListener('click', function (e) {
            if (e.target.classList.contains('fdm-remove-row')) {
                var row = e.target.closest('tr');
                row.style.opacity = '0';
                row.style.transform = 'translateX(-100%)';
                setTimeout(function() {
                    row.remove();
                    updateHiddenField();
                }, 300);
            }
        });
        
        // Form submit validation
        document.forms[0].addEventListener('submit', function (e) {
            updateHiddenField();
            var errDiv = document.getElementById('fdm-error');
            if (errDiv.innerHTML) {
                e.preventDefault();
                alert(fdmVars.fixErrorsText);
                
                // Shake animation for error div
                errDiv.style.animation = 'none';
                setTimeout(function() {
                    errDiv.style.animation = 'shake 0.5s ease-in-out';
                }, 10);
            }
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + A to add new row
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                addNewRow();
            }
        });
        
        // Initialize hidden field on load
        updateHiddenField();
        
        // Add success message after save
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('settings-updated') === 'true') {
            var successDiv = document.createElement('div');
            successDiv.className = 'fdm-success';
            successDiv.innerHTML = fdmVars.savedText || 'Settings saved successfully!';
            document.querySelector('.fdm-card').insertBefore(successDiv, document.querySelector('form'));
            
            setTimeout(function() {
                successDiv.style.opacity = '0';
                setTimeout(function() {
                    successDiv.remove();
                }, 300);
            }, 3000);
        }
    });
})();