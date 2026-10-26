import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT, backendError } from './live-repository';
@Injectable({ providedIn: 'root' })
export class Attachments {
  private client = inject(SUPABASE_CLIENT);
  private connection() {
    if (!this.client) throw new Error('Supabase is not configured.');
    return this.client;
  }
  private async owner() {
    const { data, error } = await this.connection().auth.getUser();
    if (error || !data.user) throw new Error('Sign in before accessing private files.');
    return data.user.id;
  }
  async list(healthRecordId: string) {
    const owner = await this.owner();
    const { data, error } = await this.connection()
      .from('attachments')
      .select('*')
      .eq('user_id', owner)
      .eq('health_record_id', healthRecordId)
      .order('created_at');
    if (error) throw backendError(error);
    return data;
  }
  async upload(healthRecordId: string, file: File) {
    if (file.size > 20 * 1024 * 1024) throw new Error('Choose a file smaller than 20 MiB.');
    const owner = await this.owner(),
      id = crypto.randomUUID();
    const path = `${owner}/${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'report'}`;
    const client = this.connection();
    const upload = await client.storage
      .from('mycompass-private')
      .upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
    if (upload.error) throw new Error(upload.error.message);
    const { error } = await client
      .from('attachments')
      .insert({
        id,
        user_id: owner,
        bucket: 'mycompass-private',
        object_path: path,
        original_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        health_record_id: healthRecordId,
      });
    if (error) {
      const cleanup = await client.storage.from('mycompass-private').remove([path]);
      throw new Error(
        backendError(error).message +
          (cleanup.error ? ' The upload remains unlinked and requires cleanup.' : ''),
      );
    }
  }
  async preview(id: string) {
    const owner = await this.owner(),
      client = this.connection();
    const { data, error } = await client
      .from('attachments')
      .select('bucket,object_path')
      .eq('id', id)
      .eq('user_id', owner)
      .single();
    if (error) throw backendError(error);
    const result = await client.storage.from(data.bucket).createSignedUrl(data.object_path, 60);
    if (result.error) throw new Error(result.error.message);
    return result.data.signedUrl;
  }
}
