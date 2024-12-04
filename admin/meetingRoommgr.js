let rooms = [];
        let editIndex = -1;

        const roomForm = document.getElementById('roomForm');
        const roomNameInput = document.getElementById('roomName');
        const floorNumberInput = document.getElementById('floorNumber');
        const roomTable = document.getElementById('roomTable');

        function renderRooms() {
            roomTable.innerHTML = rooms.map((room, index) => `
            <tr class="border-t">
                <td class="px-6 py-4">${room.name}</td>
                <td class="px-6 py-4">${room.floor}</td>
                <td class="px-6 py-4">
                    <button onclick="editRoom(${index})" class="text-blue-600 hover:text-blue-800 mr-2">แก้ไข</button>
                    <button onclick="deleteRoom(${index})" class="text-red-600 hover:text-red-800">ลบ</button>
                </td>
            </tr>
        `).join('');
        }

        function editRoom(index) {
            editIndex = index;
            roomNameInput.value = rooms[index].name;
            floorNumberInput.value = rooms[index].floor;
            roomForm.querySelector('button').textContent = 'แก้ไข';
        }

        function deleteRoom(index) {
            rooms = rooms.filter((_, i) => i !== index);
            renderRooms();
        }

        roomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = roomNameInput.value.trim();
            const floor = floorNumberInput.value.trim();

            if (!name || !floor) return;

            if (editIndex >= 0) {
                rooms[editIndex] = { name, floor };
                editIndex = -1;
                roomForm.querySelector('button').textContent = 'เพิ่ม';
            } else {
                rooms.push({ name, floor });
            }

            roomNameInput.value = '';
            floorNumberInput.value = '';
            renderRooms();
        });

feather.replace();