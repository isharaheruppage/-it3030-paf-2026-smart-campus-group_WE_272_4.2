// Simple API test to verify connection
import axios from 'axios';

const testApi = async () => {
    try {
        const response = await axios.get('http://localhost:8082/api/v1/tickets', {
            headers: {
                'Authorization': 'Basic ' + btoa('admin:admin')
            }
        });
        console.log('✅ API Test Success:', response.status);
        console.log('Response data:', response.data);
        return true;
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return false;
    }
};

// Run test
testApi().then(success => {
    console.log('Test Result:', success ? 'PASS' : 'FAIL');
});
