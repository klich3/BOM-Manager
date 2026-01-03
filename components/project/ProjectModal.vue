<template>
	<div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card-light rounded-2xl shadow-xl max-w-lg w-full p-6">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-text-main-light">
					{{ editingProject ? "Editar Proyecto" : "Nuevo Proyecto" }}
				</h2>
				<button @click="closeModal" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
					<XMarkIcon class="w-6 h-6 text-text-muted-light" />
				</button>
			</div>

			<form @submit.prevent="saveProject" class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-text-main-light mb-2"> Nombre del Proyecto * </label>
					<input
						v-model="projectForm.name"
						type="text"
						required
						class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
						placeholder="ej. PCB Main Controller v2.4" />
				</div>

				<div>
					<label class="block text-sm font-medium text-text-main-light mb-2"> Descripción </label>
					<textarea
						v-model="projectForm.description"
						rows="4"
						class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light resize-none"
						placeholder="Describe el proyecto..."></textarea>
				</div>

				<!-- Thumbnail Upload -->
				<div>
					<label class="block text-sm font-medium text-text-main-light mb-2">
						Imagen del Proyecto (Thumbnail)
					</label>
					<div
						class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
						@click="triggerThumbUpload"
						@drop.prevent="handleThumbDrop"
						@dragover.prevent>
						<input
							ref="thumbInputRef"
							type="file"
							accept="image/*"
							@change="handleThumbSelect"
							class="hidden" />
						<div v-if="!projectForm.thumb" class="space-y-2">
							<PhotoIcon class="w-12 h-12 text-gray-400 mx-auto" />
							<p class="text-gray-500">Arrastra una imagen o haz clic para seleccionar</p>
							<p class="text-xs text-gray-400">Formatos: JPG, PNG, WEBP</p>
						</div>
						<div v-else class="relative">
							<img
								:src="thumbUrl || projectForm.thumb"
								:alt="projectForm.name || 'Thumbnail'"
								class="w-32 h-32 object-cover rounded-lg mx-auto" />
							<button
								type="button"
								@click.stop="removeThumb"
								class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
								<XMarkIcon class="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>

				<!-- Links Section -->
				<div class="border-t border-gray-200 pt-4">
					<h3 class="text-md font-medium text-text-main-light mb-3">Enlaces del Proyecto</h3>

					<div class="space-y-3">
						<div>
							<label class="block text-sm font-medium text-text-main-light mb-1"> Repositorio Git </label>
							<input
								v-model="projectForm.git"
								type="url"
								class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
								placeholder="https://github.com/user/project" />
						</div>

						<div>
							<label class="block text-sm font-medium text-text-main-light mb-1"> Sitio Web </label>
							<input
								v-model="projectForm.web"
								type="url"
								class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-text-main-light"
								placeholder="https://project-website.com" />
						</div>

						<div>
							<label class="block text-sm font-medium text-text-main-light mb-1"> Documento PDF </label>
							<div class="flex gap-2">
								<div v-if="!projectForm.pdf" class="flex-1">
									<input
										ref="pdfInputRef"
										type="file"
										accept=".pdf"
										@change="handlePdfSelect"
										class="hidden" />
									<button
										type="button"
										@click="triggerPdfUpload"
										class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors">
										Subir PDF
									</button>
								</div>
								<div v-else class="flex items-center gap-2 flex-1">
									<div
										class="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
										<DocumentTextIcon class="w-5 h-5 text-blue-600" />
										<span class="text-sm text-text-main-light truncate max-w-xs">{{
											getFileNameFromPath(projectForm.pdf)
										}}</span>
									</div>
									<button
										type="button"
										@click="removePdf"
										class="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors">
										<XMarkIcon class="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-3 pt-4">
					<button
						type="button"
						@click="closeModal"
						class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-text-main-light hover:bg-gray-50 transition-colors">
						Cancelar
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium">
						{{ editingProject ? "Guardar" : "Crear" }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { XMarkIcon, PhotoIcon, DocumentTextIcon } from "@heroicons/vue/24/outline";
import { useFileManager } from "@/composables/useFileManager";
import { useActivityDatabase } from "@/composables/useActivityDatabase";
import { useProjectsDatabase } from "@/composables/useProjectsDatabase";
import { useFilesDatabase } from "@/composables/useFilesDatabase";

interface Project {
	id?: string;
	name: string;
	description?: string;
	thumb?: string;
	git?: string;
	web?: string;
	pdf?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface ProjectModalProps {
	show: boolean;
	editingProject?: Project | null;
}

const props = withDefaults(defineProps<ProjectModalProps>(), {
	editingProject: null,
});

const emit = defineEmits<{
	close: [];
	save: [project: Project];
}>();

const thumbInputRef = ref<HTMLInputElement | null>(null);
const pdfInputRef = ref<HTMLInputElement | null>(null);
const thumbUrl = ref("");
const { saveFile, deleteFile, getFileByName } = useFileManager();
const { logActivity } = useActivityDatabase();
const { getProjectById } = useProjectsDatabase();
const { createFile, getFilesByProjectId, deleteFilesByProjectId } = useFilesDatabase();

const projectForm = ref({
	name: "",
	description: "",
	thumb: "",
	git: "",
	web: "",
	pdf: "",
});

// Variables para almacenar los filepaths originales cuando se tienen URLs blob
const originalThumbPath = ref("");
const originalPdfPath = ref("");

// Cargar datos del proyecto al montar el componente o cuando cambia el proyecto
const loadProjectData = async () => {
	if (props.editingProject?.id) {
		try {
			const projectData = await getProjectById(props.editingProject.id);
			if (projectData) {
				// Cargar datos del proyecto
				projectForm.value = {
					name: projectData.name,
					description: projectData.description || "",
					thumb: "", // Inicializar como vacío, se llenará después con archivos
					git: projectData.git || "",
					web: projectData.web || "",
					pdf: "", // Inicializar como vacío, se llenará después con archivos
				};

				// Cargar archivos asociados al proyecto (thumbnails y PDFs)
				try {
					const projectFiles = await getFilesByProjectId(props.editingProject.id);

					/*
					{
						"id": "file_1767477887302_1npcwrr7r",
						"project_id": "id-mjyq5dal-74pcsqr2m",
						"filename": "thumb-prj-id-mjyq5dal-74pcsqr2m.png",
						"filepath": "blob:http://localhost:3000/da80688b-3153-4004-a35e-845aafa4b074",
						"file_type": "image/png",
						"size": 36622,
						"title": "Thumbnail para openHPA trigger board sensors",
						"description": "Imagen de thumbnail para el proyecto openHPA trigger board sensors",
						"created_at": "2026-01-03T22:04:47.302Z"
					}
					*/

					// Buscar thumbnail
					const thumbFile = projectFiles.find((f) => f.filename.startsWith("thumb-prj-"));
					if (thumbFile) {
						// Almacenar el filepath original para su posterior eliminación
						originalThumbPath.value = thumbFile.filepath;
						// Si el filepath es una URL blob, usamos el filename para recuperar el archivo desde OPFS
						if (thumbFile.filepath.startsWith("blob:")) {
							projectForm.value.thumb = thumbFile.filename;
						} else {
							projectForm.value.thumb = thumbFile.filepath;
						}
					}

					// Buscar PDF
					const pdfFile = projectFiles.find((f) => f.filename.startsWith("pdf-prj-"));
					if (pdfFile) {
						// Almacenar el filepath original para su posterior eliminación
						originalPdfPath.value = pdfFile.filepath;
						// Si el filepath es una URL blob, usamos el filename para recuperar el archivo desde OPFS
						if (pdfFile.filepath.startsWith("blob:")) {
							projectForm.value.pdf = pdfFile.filename;
						} else {
							projectForm.value.pdf = pdfFile.filepath;
						}
					}
				} catch (error) {
					console.error("Error cargando archivos del proyecto:", error);
				}
			}
		} catch (error) {
			console.error("Error cargando datos del proyecto:", error);
		}
	} else {
		// Reiniciar formulario para nuevo proyecto
		projectForm.value = {
			name: "",
			description: "",
			thumb: "",
			git: "",
			web: "",
			pdf: "",
		};
	}

	// Forzar actualización del watcher de thumb y pdf
	const currentThumb = projectForm.value.thumb;
	const currentPdf = projectForm.value.pdf;
	projectForm.value.thumb = "";
	projectForm.value.pdf = "";
	// Usar nextTick para asegurar que se procese el cambio vacío antes de asignar el valor real
	setTimeout(() => {
		projectForm.value.thumb = currentThumb;
		projectForm.value.pdf = currentPdf;
	}, 0);
};

// Cargar datos cuando se monta el componente
onMounted(() => {
	loadProjectData();
});

// Watch para actualizar el formulario cuando cambia editingProject
watch(
	() => props.editingProject,
	() => {
		loadProjectData();
	},
	{ immediate: false },
);

// Watch para actualizar la URL del thumbnail cuando cambia
watch(
	() => projectForm.value.thumb,
	async (newThumb) => {
		if (newThumb && !newThumb.startsWith("data:")) {
			if (newThumb.startsWith("blob:")) {
				// Si es una URL blob, intentar cargar el archivo desde OPFS usando el nombre de archivo
				// Extraer el nombre real del archivo de la URL
				const fileName = newThumb.split("/").pop()?.split("\\").pop() || newThumb;
				try {
					const fileUrl = await getFileByName(fileName);
					if (fileUrl) {
						thumbUrl.value = fileUrl;
					} else {
						thumbUrl.value = newThumb; // Si no se puede cargar, usar la URL original
					}
				} catch (error) {
					console.error("Error al cargar thumbnail desde OPFS:", error);
					thumbUrl.value = newThumb;
				}
			} else {
				// Si es una ruta de archivo (nombre de archivo), intentar cargarlo usando getFileByName
				try {
					const fileName = newThumb.split("/").pop()?.split("\\").pop() || "";
					if (fileName) {
						const fileUrl = await getFileByName(fileName);
						if (fileUrl) {
							thumbUrl.value = fileUrl;
						} else {
							thumbUrl.value = newThumb; // Si no se puede cargar, usar la URL original
						}
					}
				} catch (error) {
					console.error("Error al cargar thumbnail por nombre:", error);
					thumbUrl.value = newThumb;
				}
			}
		} else {
			// Si ya es una data URL, usar directamente
			thumbUrl.value = newThumb;
		}
	},
	{ immediate: true },
);

// Variable reactiva para la URL del PDF
const pdfUrl = ref("");

// Watch para actualizar la URL del PDF cuando cambia
watch(
	() => projectForm.value.pdf,
	async (newPdf) => {
		if (newPdf && !newPdf.startsWith("data:")) {
			if (newPdf.startsWith("blob:")) {
				// Si es una URL blob, intentar cargar el archivo desde OPFS usando el nombre de archivo
				// Extraer el nombre real del archivo de la URL
				const fileName = newPdf.split("/").pop()?.split("\\").pop() || newPdf;
				try {
					const fileUrl = await getFileByName(fileName);
					if (fileUrl) {
						pdfUrl.value = fileUrl;
					} else {
						pdfUrl.value = newPdf; // Si no se puede cargar, usar la URL original
					}
				} catch (error) {
					console.error("Error al cargar PDF desde OPFS:", error);
					pdfUrl.value = newPdf;
				}
			} else {
				// Si es una ruta de archivo (nombre de archivo), intentar cargarlo usando getFileByName
				try {
					const fileName = newPdf.split("/").pop()?.split("\\").pop() || "";
					if (fileName) {
						const fileUrl = await getFileByName(fileName);
						if (fileUrl) {
							pdfUrl.value = fileUrl;
						} else {
							pdfUrl.value = newPdf; // Si no se puede cargar, usar la URL original
						}
					}
				} catch (error) {
					console.error("Error al cargar PDF por nombre:", error);
					pdfUrl.value = newPdf;
				}
			}
		} else {
			// Si ya es una data URL, usar directamente
			pdfUrl.value = newPdf;
		}
	},
	{ immediate: true },
);

// Thumbnail handling functions
const triggerThumbUpload = () => {
	if (thumbInputRef.value) {
		thumbInputRef.value.click();
	}
};

const handleThumbDrop = (event: DragEvent) => {
	const files = event.dataTransfer?.files;
	if (files && files.length > 0) {
		handleImageFile(files[0]);
	}
};

const handleThumbSelect = (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files.length > 0) {
		handleImageFile(input.files[0]);
	}
};

const handleImageFile = async (file: File) => {
	if (!file.type.startsWith("image/")) {
		alert("Por favor selecciona un archivo de imagen válido");
		return;
	}

	try {
		// Guardar imagen y obtener URL
		// Usar ID del proyecto o timestamp si es nuevo proyecto
		const projectId = props.editingProject?.id || `new_${Date.now()}`;
		const extension = file.name.split(".").pop() || "jpg";
		const fileName = `thumb-prj-${projectId}.${extension}`;

		// Si ya existe un thumb anterior, eliminarlo primero
		if (projectForm.value.thumb) {
			await deleteFile(projectForm.value.thumb);
		}

		const fileUrl = await saveFile(file, fileName);

		// Si tenemos un proyecto existente, crear registro en la tabla de archivos
		if (props.editingProject?.id) {
			try {
				await createFile({
					project_id: props.editingProject.id,
					filename: fileName,
					filepath: fileUrl,
					file_type: file.type,
					size: file.size,
					title: `Thumbnail para ${projectForm.value.name || "proyecto"}`,
					description: `Imagen de thumbnail para el proyecto ${
						projectForm.value.name || props.editingProject.id
					}`,
				});
			} catch (error) {
				console.error("Error creando registro de archivo:", error);
			}
		}

		projectForm.value.thumb = fileUrl;
	} catch (error) {
		console.error("Error saving image:", error);
		alert("Error al guardar la imagen");
	}
};

const removeThumb = async () => {
	if (projectForm.value.thumb) {
		try {
			// Si tenemos un proyecto existente, buscar el filepath original para eliminarlo del sistema de archivos
			if (props.editingProject?.id) {
				try {
					// Buscar archivos asociados al proyecto
					const projectFiles = await getFilesByProjectId(props.editingProject.id);
					// Encontrar el archivo que coincide con el nombre actual
					const fileToRemove = projectFiles.find(
						(f) => f.filename === projectForm.value.thumb || f.filepath === projectForm.value.thumb,
					);
					if (fileToRemove) {
						// Eliminar archivo del sistema de archivos pasando el objeto completo
						await deleteFile(fileToRemove);
						// Eliminar el registro de archivo de la base de datos
						await useFilesDatabase().deleteFile(fileToRemove.id);
					} else {
						// Si no se encuentra en la base de datos, intentar eliminar usando el path original o directamente
						const originalPath = originalThumbPath.value || projectForm.value.thumb;
						await deleteFile(originalPath);
					}
				} catch (error) {
					console.error("Error eliminando registro de archivo:", error);
					// Si falla la búsqueda en la base de datos, intentar eliminar usando el path original o directamente
					const originalPath = originalThumbPath.value || projectForm.value.thumb;
					await deleteFile(originalPath);
				}
			} else {
				// Si es un proyecto nuevo, eliminar directamente
				const originalPath = originalThumbPath.value || projectForm.value.thumb;
				await deleteFile(originalPath);
			}

			// Registrar actividad de eliminación
			const projectId = props.editingProject?.id || "new_project";
			await logActivity("DELETE", "projects", projectId, "Thumbnail eliminado", undefined);
		} catch (error) {
			console.error("Error eliminando thumbnail:", error);
		}
	}
	projectForm.value.thumb = "";
	thumbUrl.value = "";
	originalThumbPath.value = "";
	if (thumbInputRef.value) {
		thumbInputRef.value.value = "";
	}
};

// PDF handling functions
const triggerPdfUpload = () => {
	if (pdfInputRef.value) {
		pdfInputRef.value.click();
	}
};

const handlePdfSelect = (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files.length > 0) {
		handlePdfFile(input.files[0]);
	}
};

const handlePdfFile = async (file: File) => {
	if (file.type !== "application/pdf") {
		alert("Por favor selecciona un archivo PDF válido");
		return;
	}

	try {
		// Guardar PDF y obtener URL
		// Usar ID del proyecto o timestamp si es nuevo proyecto
		const projectId = props.editingProject?.id || `new_${Date.now()}`;
		const fileName = `pdf-prj-${projectId}.pdf`;

		// Si ya existe un PDF anterior, eliminarlo primero
		if (projectForm.value.pdf && projectForm.value.pdf.startsWith("blob:")) {
			await deleteFile(projectForm.value.pdf);
		}

		const fileUrl = await saveFile(file, fileName);

		// Si tenemos un proyecto existente, crear registro en la tabla de archivos
		if (props.editingProject?.id) {
			try {
				await createFile({
					project_id: props.editingProject.id,
					filename: fileName,
					filepath: fileUrl,
					file_type: file.type,
					size: file.size,
					title: `PDF para ${projectForm.value.name || "proyecto"}`,
					description: `Documento PDF para el proyecto ${projectForm.value.name || props.editingProject.id}`,
				});
			} catch (error) {
				console.error("Error creando registro de archivo:", error);
			}
		}

		projectForm.value.pdf = fileUrl;
	} catch (error) {
		console.error("Error saving PDF:", error);
		alert("Error al guardar el PDF");
	}
};

const removePdf = async () => {
	if (projectForm.value.pdf) {
		try {
			// Si tenemos un proyecto existente, buscar el filepath original para eliminarlo del sistema de archivos
			if (props.editingProject?.id) {
				try {
					// Buscar archivos asociados al proyecto
					const projectFiles = await getFilesByProjectId(props.editingProject.id);
					// Encontrar el archivo que coincide con el nombre actual
					const fileToRemove = projectFiles.find(
						(f) => f.filename === projectForm.value.pdf || f.filepath === projectForm.value.pdf,
					);
					if (fileToRemove) {
						// Eliminar archivo del sistema de archivos pasando el objeto completo
						await deleteFile(fileToRemove);
						// Eliminar el registro de archivo de la base de datos
						await useFilesDatabase().deleteFile(fileToRemove.id);
					} else {
						// Si no se encuentra en la base de datos, intentar eliminar usando el path original o directamente
						const originalPath = originalPdfPath.value || projectForm.value.pdf;
						await deleteFile(originalPath);
					}
				} catch (error) {
					console.error("Error eliminando registro de archivo:", error);
					// Si falla la búsqueda en la base de datos, intentar eliminar usando el path original o directamente
					const originalPath = originalPdfPath.value || projectForm.value.pdf;
					await deleteFile(originalPath);
				}
			} else {
				// Si es un proyecto nuevo, eliminar directamente
				const originalPath = originalPdfPath.value || projectForm.value.pdf;
				await deleteFile(originalPath);
			}

			// Registrar actividad de eliminación
			const projectId = props.editingProject?.id || "new_project";
			await logActivity("DELETE", "projects", projectId, "PDF eliminado", undefined);
		} catch (error) {
			console.error("Error eliminando PDF:", error);
		}
	}
	projectForm.value.pdf = "";
	pdfUrl.value = "";
	originalPdfPath.value = "";
	if (pdfInputRef.value) {
		pdfInputRef.value.value = "";
	}
};

const closeModal = () => {
	emit("close");
};

const saveProject = async () => {
	// Validar campos requeridos
	if (!projectForm.value.name.trim()) {
		alert("El nombre del proyecto es obligatorio");
		return;
	}

	try {
		// Registrar actividad de creación/edición
		const action = props.editingProject ? "UPDATE" : "CREATE";
		const projectId = props.editingProject?.id || "new_project";
		const description = props.editingProject
			? `Proyecto "${projectForm.value.name}" actualizado`
			: `Proyecto "${projectForm.value.name}" creado`;

		await logActivity(action, "projects", projectId, description);

		// Registrar actividad por cada archivo adjunto
		if (projectForm.value.thumb) {
			await logActivity("UPLOAD", "projects", projectId, "Thumbnail subido", undefined);
		}

		if (projectForm.value.pdf) {
			await logActivity("UPLOAD", "projects", projectId, "Documento PDF adjuntado", undefined);
		}

		// Incluir el ID del proyecto en los datos si está editando
		const { thumb, pdf, ...projectData } = {
			...projectForm.value,
			id: props.editingProject?.id || undefined,
		};
		emit("save", projectData);
	} catch (error) {
		console.error("Error guardando proyecto:", error);
		alert("Error al guardar el proyecto");
	}
};

const getFileNameFromPath = (path: string): string => {
	if (!path) return "";

	// Si es una URL de objeto (blob:) o data URL
	if (path.startsWith("blob:") || path.startsWith("data:")) {
		// Buscar si el nombre del archivo está en la URL
		const fileNameMatch = path.match(/pdf-prj-[a-zA-Z0-9_-]+\.pdf/i);
		if (fileNameMatch) {
			return fileNameMatch[0];
		}
		// Si no se encuentra con el patrón específico, intentar extraer cualquier nombre .pdf
		const genericMatch = path.match(/[^/\\&\?]*\.pdf$/i);
		if (genericMatch) {
			return genericMatch[0];
		}
		// Si no se encuentra, usar el patrón estándar con el ID del proyecto
		const projectId = props.editingProject?.id || `new_${Date.now()}`;
		return `pdf-prj-${projectId}.pdf`;
	}

	// Si es una ruta normal (como la que se guarda en la base de datos), devolver el nombre del archivo
	return path.split("/").pop()?.split("\\").pop() || `pdf-prj-${props.editingProject?.id || `new_${Date.now()}`}.pdf`;
};
</script>
