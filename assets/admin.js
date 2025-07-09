(function () {
    function serializeTable() {
        var rows = document.querySelectorAll('#fdm-table tbody tr');
        var map = {};
        var errors = [];
        var seen = {};
        rows.forEach(function (row, idx) {
            var host = row.querySelector('.fdm-host').value.trim();
            var port = row.querySelector('.fdm-port').value.trim();
            var ip = row.querySelector('.fdm-ip').value.trim();
            if (!host) errors.push(fdmVars.rowText + ' ' + (idx + 1) + ': ' + fdmVars.domainMissingText);
            if (!port || isNaN(port) || port < 1 || port > 65535) errors.push(fdmVars.rowText + ' ' + (idx + 1) + ': ' + fdmVars.invalidPortText);
            if (!/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/.test(ip) && !/^([a-fA-F0-9:]+)$/.test(ip)) errors.push(fdmVars.rowText + ' ' + (idx + 1) + ': ' + fdmVars.invalidIpText);
            var key = host + ':' + port;
            if (seen[key]) errors.push(fdmVars.rowText + ' ' + (idx + 1) + ': ' + fdmVars.duplicateText);
            seen[key] = true;
            map[key] = ip;
        });
        return { json: JSON.stringify(map), errors: errors };
    }
    
    function updateHiddenField() {
        var result = serializeTable();
        document.getElementById('fdm_hosts_mapping').value = result.json;
        var errDiv = document.getElementById('fdm-error');
        if (result.errors.length) {
            errDiv.innerHTML = result.errors.join('<br>');
        } else {
            errDiv.innerHTML = '';
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelector('.fdm-add-row').addEventListener('click', function () {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td><input type="text" class="fdm-host" /></td>' +
                '<td><input type="number" class="fdm-port" min="1" max="65535" value="80" /></td>' +
                '<td><input type="text" class="fdm-ip" /></td>' +
                '<td><span class="fdm-remove-row">&times;</span></td>';
            document.querySelector('#fdm-table tbody').appendChild(tr);
            updateHiddenField();
        });
        
        document.querySelector('#fdm-table').addEventListener('input', updateHiddenField);
        document.querySelector('#fdm-table').addEventListener('change', updateHiddenField);
        document.querySelector('#fdm-table').addEventListener('click', function (e) {
            if (e.target.classList.contains('fdm-remove-row')) {
                e.target.closest('tr').remove();
                updateHiddenField();
            }
        });
        
        document.forms[0].addEventListener('submit', function (e) {
            updateHiddenField();
            var errDiv = document.getElementById('fdm-error');
            if (errDiv.innerHTML) {
                e.preventDefault();
                alert(fdmVars.fixErrorsText);
            }
        });
        
        // Initialize hidden field on load
        updateHiddenField();
    });
})();