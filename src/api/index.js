import { create, } from 'apisauce';
import { encodedData } from '../utils/helper';

class Api {
    constructor() {
        this.api = create({
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            // API base URL
            timeout: 10000,
        });
    }

    // Common response handler
    handleResponse = response => {
        // console.log("Respnse", JSON.stringify(response, null, 2));
        if (response.ok) {
            return { status: true, data: response.data };
        } else {
            throw response.problem;
        }
    };

    // Common error handler
    handleError = error => {
        throw error;
    };

    // POST request
    post = async (url, data, headers = {}) => {
        try {
            const response = await this.api.post(url, encodedData(data), { headers });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    };

    // GET request
    get = async (url, headers = {}) => {
        try {
            const response = await this.api.get(url, null, { headers });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    };

    // PUT request
    put = async (url, data, headers = {}) => {
        try {
            const response = await this.api.put(url, data, { headers });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    };

    // PATCH request
    patch = async (url, data, headers = {}) => {
        try {
            const response = await this.api.patch(url, data, { headers });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    };

    // DELETE request
    delete = async (url, headers = {}) => {
        try {
            const response = await this.api.delete(url, null, { headers });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    };
}

export default new Api();