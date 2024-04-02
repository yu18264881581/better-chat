import { ILoginParams, ILoginResponseData } from './type';

import Request from '@/utils/request';

export const handleLogin = async (data: ILoginParams) => {
	const res = await Request.post<ILoginParams, ILoginResponseData>('/auth/login', data);
	return res.data;
};
