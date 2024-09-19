document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    let allCourses = {}; // To store all courses data

    fetch('output.json')
    .then(response => response.json())
    .then(data => {
        allCourses = data; // Store the data for later use
        const semesterSelect = document.getElementById('semester-select');
        
        // Extract years and semesters into an array
        let semesters = [];
        for (const year in data) {
            if (data.hasOwnProperty(year)) {
                for (const semester in data[year]) {
                    if (data[year].hasOwnProperty(semester)) {
                        semesters.push({ year, semester });
                    }
                }
            }
        }

        // Sort the array in descending order
        semesters.sort((a, b) => {
            if (a.year !== b.year) {
                return b.year - a.year; // Sort by year descending
            }
            return b.semester - a.semester; // Sort by semester descending
        });

        // Append sorted options to the dropdown
        semesters.forEach(({ year, semester }) => {
            let semesterName;
            switch (semester) {
                case '1':
                    semesterName = 'Fall';
                    break;
                case '2':
                    semesterName = 'Spring';
                    break;
                case '3':
                    semesterName = 'Summer';
                    break;
                default:
                    semesterName = 'Unknown';
            }
            const option = document.createElement('option');
            option.value = `${year}-${semester}`;
            option.textContent = `${year} ${semesterName}`;
            semesterSelect.appendChild(option);
        });

        // Listen for changes on the semester dropdown
        semesterSelect.addEventListener('change', function() {
            const [selectedYear, selectedSemester] = this.value.split('-');
            updateCourses(selectedYear, selectedSemester);
        });

        // Initially load courses for the first available semester
        const firstOption = semesterSelect.options[0];
        if (firstOption) {
            const [initialYear, initialSemester] = firstOption.value.split('-');
            updateCourses(initialYear, initialSemester);
        }
    })
    .catch(error => console.error('Error fetching semesters:', error));

    function updateCourses(year, semester) {
        const courseList = document.getElementById('course-list');
        const searchInput = document.getElementById('search-input');
        const searchButtons = document.querySelectorAll('.search-buttons button');
        const scheduleList = document.getElementById('schedule-list');
        const timetableBody = document.getElementById('timetable-body');
        const saturdayHeader = document.querySelector('th.hidden');
        let courses = allCourses[year][semester].flatMap(dept => dept.deptcourses);
        let selectedSearchType = 'code'; // Default search type
        let scheduledCourses = new Set(); // To keep track of scheduled courses
    
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
    
        const hourToTimeSlot = {
            '1': '09:00',
            '2': '10:00',
            '3': '11:00',
            '4': '12:00',
            '5': '13:00',
            '6': '14:00',
            '7': '15:00',
            '8': '16:00',
            '9': '17:00',
            '10': '18:00',
            '11': '19:00',
            '12': '20:00',
            '13': '21:00',
            '14': '22:00'
        };
    
        function normalizeCourseName(name) {
            return name.replace(/\s+/g, '').toLowerCase();
        }
    
        function sortCoursesByDeptCode(courses) {
            return courses.sort((a, b) => {
                const deptCodeA = a.name.split(' ')[0];
                const deptCodeB = b.name.split(' ')[0];
                return deptCodeA.localeCompare(deptCodeB);
            });
        }
    
        const buildingLocations = {
            'TB': { Lat: '41.083842', Lng: '29.051324', NameEn: 'Anderson Hall (The Faculty of Arts and Sciences), South Campus' },
            'M': { Lat: '41.084012', Lng: '29.050520', NameEn: 'Perkins Hall (The Faculty of Engineering), South Campus' },
            'BİM': { Lat: '41.083519', Lng: '29.050166', NameEn: 'Computer Center, South Campus' },
            'JF': { Lat: '41.084263', Lng: '29.051239', NameEn: 'John Freely Hall, South Campus' },
            'İB': { Lat: '41.083632', Lng: '29.053266', NameEn: 'Washburn Hall (The Faculty of Economics and Administrative Sciences), South Campus' },
            'NB': { Lat: '41.082581', Lng: '29.051925', NameEn: 'Natuk Birkan Building, South Campus' },
            'NBZ': { Lat: '41.082581', Lng: '29.051925', NameEn: 'Natuk Birkan Building, South Campus' },
            'KB': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' },
            'KBZ': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' },
            'KBDAĞÖZAY': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' },
            'KBFOURIER': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' },
            'KBKIRCHHOFF': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' },
            'KBMAXWELL': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' }, 
            'KBNEWCLASS': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' }, 
            'KBSHANNON': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' },
            'KBSEMİNERSALONU': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' },
            'KBTESLA': { Lat: '41.085961', Lng: '29.044758', NameEn: 'Science and Engineering Building, North Campus' },
            'BM': { Lat: '41.086139', Lng: '29.043943', NameEn: 'Computer Engineering Building, North Campus' },
            'BMA': { Lat: '41.086139', Lng: '29.043943', NameEn: 'Computer Engineering Building, North Campus' },
            'BMB': { Lat: '41.086139', Lng: '29.043943', NameEn: 'Computer Engineering Building, North Campus' },
            'ET': { Lat: '41.086398', Lng: '29.044109', NameEn: 'ETA-B Block, North Campus' },
            'ETB': { Lat: '41.086398', Lng: '29.044109', NameEn: 'ETA-B Block, North Campus' },
            'NH': { Lat: '41.086620', Lng: '29.044887', NameEn: 'New Hall, North Campus' },
            'EF': { Lat: '41.086863', Lng: '29.044292', NameEn: 'The Faculty of Education, North Campus' },
            'KYD': { Lat: '41.087445', Lng: '29.043739', NameEn: 'SFL Building-North, North Campus' },
            'YYD': { Lat: '41.086692', Lng: '29.043987', NameEn: 'New SFL Building, North Campus' },
            'KP': { Lat: '41.088084', Lng: '29.043600', NameEn: 'North Park Building, North Campus' },
            'HA': { Lat: '41.088929', Lng: '29.050563', NameEn: 'Hisar Campus-Block A, Hisar Campus' },
            'HB': { Lat: '41.088929', Lng: '29.050563', NameEn: 'Hisar Campus-Block B, Hisar Campus' },
            'HC': { Lat: '41.088929', Lng: '29.050563', NameEn: 'Hisar Campus-Block C, Hisar Campus' },
            'HD': { Lat: '41.088929', Lng: '29.050563', NameEn: 'Hisar Campus-Block D, Hisar Campus' },
            'HE': { Lat: '41.088929', Lng: '29.050563', NameEn: 'Hisar Campus-Block E, Hisar Campus' },
            'SH': { Lat: '41.083614', Lng: '29.052484', NameEn: 'Sloane Hall (Departments of Psychology and Sociology), South Campus' },
            'GKM': { Lat: '41.083614', Lng: '29.052484', NameEn: 'Garanti Cultural Centre, Uçak Savar Campus' },
            'BME': { Lat: '41.0631388', Lng: '29.0654085', NameEn: 'Institute of Biomedical Engineering, Kandilli Campus' },
            'SA': { Lat: '41.083614', Lng: '29.052484', NameEn: 'YADYOK, Kilyos Campus' },
            'Square': { Lat: '41.083548', Lng: '29.052243', NameEn: 'Building not found.' }
        };

        function formatCourseTime(days, hours, rooms) {
            const roomList = rooms.split('|').map(room => room.trim());
            return days.map((day, index) => {
            const room = roomList[index] ? roomList[index] : '';
            const buildingCode = room.replace(/\d/g, '').replace(/\s/g, '');
            const building = buildingLocations[buildingCode] || buildingLocations['Square'];
            const roomLink = building ? `<a href="https://www.google.com/maps/search/?api=1&query=${building.Lat},${building.Lng}" target="_blank" ${building.NameEn === 'Building not found.' ? `onclick="alert('${room} not found. \\nRedirecting to the South Campus.')"` : ''}>${room}</a>` : '';
            return `${daysOfWeek[day]} ${hourToTimeSlot[hours[index]]} ${roomLink}`.trim();
            }).join(', ');
        }
        
    
        function displayCourses(filteredCourses) {
            courseList.innerHTML = ''; // Clear any existing content
            filteredCourses.forEach(course => {
                const [courseCode, courseSection] = course.name.split('.');
                let courseUrl = `https://registration.bogazici.edu.tr/scripts/schedule/coursedescription.asp?course=${courseCode}&section=${courseSection}&term=2024/2025-1`;
                const courseAbbr = courseCode.replace(/\d/g, '').replace(/\s/g, '');
                const courseNum = courseCode.replace(/\D/g, '');
                let quotaUrl = `https://registration.bogazici.edu.tr/scripts/quotasearch.asp?abbr=${courseAbbr}&code=${courseNum}&section=${courseSection}&donem=2024/2025-1`;
        
                const courseCard = document.createElement('div');
                courseCard.className = 'col-md-12 course-card';
                courseCard.innerHTML = `
                <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${course.fullName}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">
                    <a href="${courseUrl}" target="_blank">${course.name}</a>
                    ${course.credits && !course.fullName.toLowerCase().includes('lab') && !course.fullName.toLowerCase().includes('p.s.') ? `<span class="badge" style="background-color: #1e4a8b; color: white; margin-left: 10px;">${course.credits} Cr</span>` : ''}
                    ${course.credits && !course.fullName.toLowerCase().includes('lab') && !course.fullName.toLowerCase().includes('p.s.') ? `<a href="${quotaUrl}" target="_blank" class="badge" title="only for current semester" style="background-color: #8cc8ea; color: white; margin-left: 10px;">Quota</a>` : ''}
                    </h6>
                    <p>${course.parentName}</p>
                    <p>${formatCourseTime(course.days, course.hours, course.rooms)}</p>
                    <button class="btn btn-info add-to-schedule" data-course-id="${course.name}" data-credits="${course.credits}" style="background-color: #4a8bbd; color: white;">Add to Schedule</button>
                </div>
                </div>
                `;
                courseList.appendChild(courseCard);
            });
        
            document.querySelectorAll('.add-to-schedule').forEach(button => {
                button.addEventListener('click', function() {
                    const courseId = this.getAttribute('data-course-id');
                    const course = courses.find(c => c.name === courseId);
                    if (!scheduledCourses.has(courseId)) {
                        addToSchedule(course);
                        scheduledCourses.add(courseId);
                    }
                });
            });
        }
        
    
        function filterCourses() {
            const searchTerm = searchInput.value.toLowerCase();
            const searchTerms = searchTerm.split(' ').filter(term => term); // Split by spaces and remove empty terms
            const normalizedSearchTerm = normalizeCourseName(searchTerm);
    
            const filteredCourses = courses.filter(course => {
                if (selectedSearchType === 'code') {
                    const normalizedCourseCode = normalizeCourseName(course.name);
                    return normalizedCourseCode.includes(normalizedSearchTerm);
                } else if (selectedSearchType === 'title') {
                    return searchTerms.every(term =>
                        course.fullName.toLowerCase().includes(term)
                    );
                } else if (selectedSearchType === 'instructor') {
                    return searchTerms.every(term =>
                        course.parentName.toLowerCase().includes(term)
                    );
                }
            });
    
            displayCourses(filteredCourses);
        }
    
        searchButtons.forEach(button => {
            button.addEventListener('click', function() {
                selectedSearchType = this.getAttribute('data-search-type');
                searchButtons.forEach(btn => btn.style.backgroundColor = '#8cc8ea');
                this.style.backgroundColor = '#1e4a8b';
                filterCourses(); // Trigger search immediately after changing search type
            });
        });
    
        function addToSchedule(course) {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'py-1 px-2 flex items-center';
            scheduleItem.setAttribute('data-credits', course.credits);
            const isCoreCourse = !course.fullName.toLowerCase().includes('lab') && !course.fullName.toLowerCase().includes('p.s.');
            scheduleItem.innerHTML = `
            <span class="cursor-pointer text-zinc-600 dark:text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" style="height: 1.25rem; width: 1.25rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </span>
            <span class="ml-1 text-gray-500 dark:text-gray-400 opacity-50 text-sm">${course.name}</span>
            <span class="ml-1">${course.fullName}</span>
            ${isCoreCourse ? `<span class="ml-2 text-xs border rounded-full px-1 bg-green-50 text-green-700 border-green-700 dark:bg-green-900 dark:text-green-300 dark:border-green-300 border-opacity-50">${course.credits} Cr</span>` : ''}
            `;
            scheduleList.appendChild(scheduleItem);
    
            const removeButton = scheduleItem.querySelector('span.cursor-pointer');
            removeButton.addEventListener('click', function() {
                scheduleList.removeChild(scheduleItem);
                scheduledCourses.delete(course.name);
                removeFromTimetable(course);
            });
    
            addToTimetable(course);
            updateCourseInfo(); // Update course info after adding to schedule
        }
    
        function addToTimetable(course) {
            const roomList = course.rooms.split('|').map(room => room.trim());
            course.days.forEach((day, index) => {
                const dayIndex = day; // 0-based indexing
                const timeSlot = hourToTimeSlot[course.hours[index]]; // Use mapped time slot
    
                const room = roomList[index] || 'TBA';
    
                console.log(`Course: ${course.name}, Day: ${day}, Day Index: ${dayIndex}, Time Slot: ${timeSlot}, Room: ${room}`);
    
                if (dayIndex >= 0 && dayIndex < daysOfWeek.length) {
                    let row = timetableBody.querySelector(`tr[data-time-slot="${timeSlot}"]`);
                    if (!row) {
                        row = document.createElement('tr');
                        row.setAttribute('data-time-slot', timeSlot);
                        if (parseInt(timeSlot.split(':')[0]) >= 18) {
                            row.classList.add('hidden-row'); // Initially hide rows after 18:00
                        }
                        const timeCell = document.createElement('th');
                        timeCell.className = 'md:p-1 time-cell';
                        timeCell.textContent = timeSlot.split(':')[0];
                        row.appendChild(timeCell);
                        daysOfWeek.forEach((_, dayIndex) => {
                            const cell = document.createElement('td');
                            cell.setAttribute('data-day', dayIndex);
                            if (dayIndex === 5) {
                                cell.classList.add('hidden');
                            }
                            row.appendChild(cell);
                        });
                        timetableBody.appendChild(row);
                    }
    
                    const cell = row.querySelector(`td[data-day="${dayIndex}"]`);
                    if (cell) {
                        console.log(`Adding course ${course.name} to ${timeSlot} on day index ${dayIndex}`);
                        const courseDiv = document.createElement('div');
                        courseDiv.className = 'leading-tight p-px';
                        courseDiv.textContent = `${course.name} ${room}`;
    
                        if (cell.innerHTML.trim() !== '') {
                            cell.classList.add('conflict'); // Add a class to indicate conflict
                        } else {
                            cell.classList.add('bg-info', 'text-white');
                        }
    
                        cell.appendChild(courseDiv);
    
                        if (dayIndex === 5) { // If the course is on Saturday
                            saturdayHeader.classList.remove('hidden');
                            timetableBody.querySelectorAll('.hidden').forEach(cell => cell.classList.remove('hidden'));
                        }
                        if (parseInt(course.hours[index]) >= 9) { // If the course is after 17:00
                            timetableBody.querySelectorAll(`tr[data-time-slot]`).forEach(r => {
                                if (parseInt(r.getAttribute('data-time-slot').split(':')[0]) >= 18) {
                                    r.classList.remove('hidden-row');
                                }
                            });
                        }
                    }
                } else {
                    console.warn(`Invalid day value: ${day}`);
                }
            });
        }
    
        function removeFromTimetable(course) {
            const roomList = course.rooms.split('|').map(room => room.trim());
            course.days.forEach((day, index) => {
                const dayIndex = day;
                const timeSlot = hourToTimeSlot[course.hours[index]];
                const cell = timetableBody.querySelector(`tr[data-time-slot="${timeSlot}"] td[data-day="${dayIndex}"]`);
                if (cell) {
                    // Remove the specific course div
                    const courseDiv = Array.from(cell.children).find(div => div.textContent.includes(course.name));
                    if (courseDiv) {
                        cell.removeChild(courseDiv);
                    }
    
                    // Check if there are any remaining courses in the cell
                    if (cell.children.length === 0) {
                        cell.classList.remove('bg-info', 'text-white', 'conflict');
                    } else if (cell.children.length === 1) {
                        // If only one course remains, remove the conflict class
                        cell.classList.remove('conflict');
                        cell.classList.add('bg-info', 'text-white');
                    }
                }
            });
    
            // Check if there are any courses on Saturday
            const hasSaturdayCourses = Array.from(timetableBody.querySelectorAll('td[data-day="5"]'))
                .some(cell => cell.textContent.trim() !== '');
            if (!hasSaturdayCourses) {
                saturdayHeader.classList.add('hidden');
                timetableBody.querySelectorAll('td[data-day="5"]').forEach(cell => cell.classList.add('hidden'));
            }
    
            // Check if there are any courses after 17:00
            const hasLateCourses = Array.from(timetableBody.querySelectorAll('tr.hidden-row td'))
                .some(cell => cell.textContent.trim() !== '');
            if (!hasLateCourses) {
                timetableBody.querySelectorAll('tr.hidden-row').forEach(row => row.classList.add('hidden'));
            }
    
            // Check if there are any courses extending the timetable hours
            const maxHour = Math.max(...Array.from(timetableBody.querySelectorAll('tr[data-time-slot]'))
                .filter(row => Array.from(row.querySelectorAll('td')).some(cell => cell.textContent.trim() !== ''))
                .map(row => parseInt(row.getAttribute('data-time-slot').split(':')[0])));
            const endHour = maxHour > 13 ? maxHour : 13; // Default end hour is 22:00 (14th hour)
    
            timetableBody.querySelectorAll('tr[data-time-slot]').forEach(row => {
                const rowHour = parseInt(row.getAttribute('data-time-slot').split(':')[0]);
                if (rowHour > endHour && rowHour >= 18) { // Only remove rows after 17:00
                    row.remove();
                }
            });
    
            updateCourseInfo(); // Update course info after removing from timetable
        }
    
        function createTimetable() {
            const maxHour = Math.max(...courses.flatMap(course => course.hours));
            const endHour = maxHour > 13 ? maxHour : 13; // Default end hour is 22:00 (14th hour)
    
            const filteredTimeSlots = timeSlots.slice(0, endHour);
    
            filteredTimeSlots.forEach(timeSlot => {
                const row = document.createElement('tr');
                row.setAttribute('data-time-slot', timeSlot);
                if (parseInt(timeSlot.split(':')[0]) >= 18) {
                    row.classList.add('hidden-row'); // Initially hide rows after 18:00
                }
                const timeCell = document.createElement('th');
                timeCell.className = 'md:p-1 time-cell';
                timeCell.textContent = timeSlot.split(':')[0];
                row.appendChild(timeCell);
                daysOfWeek.forEach((day, index) => {
                    const cell = document.createElement('td');
                    cell.setAttribute('data-day', index);
                    if (index === 5) {
                        cell.classList.add('hidden');
                    }
                    row.appendChild(cell);
                });
                timetableBody.appendChild(row);
            });
        }
    
        // Clear the timetable and scheduled courses before updating
        timetableBody.innerHTML = '';
        scheduleList.innerHTML = '';
        scheduledCourses.clear();
    
        // Include extra sessions in the courses list
        courses = courses.flatMap(course => {
            const extras = course.extras || [];
            const extraCourses = extras.map((extra, index) => ({
                ...extra,
                name: `${course.name} ${extra.fullName} ${index + 1}`,
                fullName: `${course.fullName} ${extra.fullName}`,
                credits: '', // No credits for extra sessions
                Quota: '' // No quota for extra sessions
            }));
            return [course, ...extraCourses];
        });
    
        courses = sortCoursesByDeptCode(courses); // Sort courses by department code
        displayCourses(courses); // Display all courses initially
        createTimetable(); // Create the timetable structure
    
        searchInput.addEventListener('input', filterCourses);
    
        searchButtons.forEach(button => {
            button.addEventListener('click', function() {
                selectedSearchType = this.getAttribute('data-search-type');
                searchButtons.forEach(btn => btn.classList.remove('btn-primary', 'btn-secondary', 'btn-success'));
                this.classList.add('btn-primary');
                filterCourses(); // Trigger search immediately after changing search type
            });
        });
    }
    

    function updateCourseInfo() {
        const totalCoursesElement = document.getElementById('total-courses');
        const totalCreditsElement = document.getElementById('total-credits');
        const scheduleList = document.getElementById('schedule-list');
        const courses = scheduleList.children;
        let totalCredits = 0;
        let totalCourses = 0;
    
        for (let course of courses) {
            const credits = parseInt(course.getAttribute('data-credits'), 10);
            const courseName = course.querySelector('.text-sm').textContent;
    
            // Check if the course is a lab or PS session
            if (!courseName.toLowerCase().includes('lab') && !courseName.toLowerCase().includes('p.s.')) {
                totalCourses += 1;
            }
    
            // Add credits only if it's not a lab or PS session
            if (!isNaN(credits) && !courseName.toLowerCase().includes('lab') && !courseName.toLowerCase().includes('p.s.')) {
                totalCredits += credits;
            }
        }
    
        totalCoursesElement.textContent = totalCourses;
        totalCreditsElement.textContent = `Total Credits: ${totalCredits}`;
    }
    
    document.getElementById('download-picture').addEventListener('click', async () => {
        const timetableElement = document.querySelector('.schedule-pane table');
        if (!timetableElement) {
            alert('Timetable not found.');
            return;
        }

        // Use html2canvas to capture the timetable as an image
        html2canvas(timetableElement).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'timetable.png';
            link.click();
        }).catch(error => {
            console.error('Error capturing timetable:', error);
            alert('Failed to capture timetable.');
        });
    });

    document.getElementById('export-table').addEventListener('click', function() {
        const table = document.querySelector('.schedule-pane table');
        const rows = Array.from(table.rows);
        let csvContent = '';
        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const rowContent = cells.map(cell => cell.innerText).join(',');
            csvContent += rowContent + '\n';
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'timetable.csv');
    });
});
