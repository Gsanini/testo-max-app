import type { Action, Workspace } from '@/domain/types'
import {load, mutate} from '@/demo/repository'

export async function loadWorkspace(): Promise<Workspace> {return load()}
export async function saveAction(action: Action): Promise<void> {return mutate(action)}
