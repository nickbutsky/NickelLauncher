from typing import Any, Callable
from xml.etree.ElementTree import Element, SubElement
from uuid import uuid4
import random
import logging

from env import ROOT
from report import Report
from net import request, soap
from core.version import Version, Architecture


class LinkRetrievalError(Exception):
    pass


def download(version: Version, architecture: Architecture, reporthook: Callable[[Report], Any] | None = None):
    logging.debug('Retrieving a download link...')
    if reporthook:
        reporthook(Report(Report.PROGRESS, 'Retrieving a download link'))
    link = _get_link(random.choice(version.guids[architecture]))
    if not link:
        logging.error("Couldn't retrieve a download link")
        raise LinkRetrievalError("Couldn't retrieve a download link")

    logging.debug(f'Downloading a package to "{version.packages[architecture]}"...')
    temp_file = ROOT / 'temp' / str(uuid4())
    request.download_file(link, temp_file)
    temp_file.replace(version.packages[architecture])


def _get_link(guid: str) -> str:
    secured_url = 'https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured'
    envelope = _build_link_request_envelope(secured_url, guid)
    response_envelope = soap.post_envelope(secured_url, envelope)
    return _extract_link(response_envelope)


def _extract_link(response_envelope: Element) -> str:
    file_locations = response_envelope.find(
        './{*}Body/{*}GetExtendedUpdateInfo2Response/{*}GetExtendedUpdateInfo2Result/{*}FileLocations'
    )
    if not file_locations:
        return ''
    for file_location in file_locations:
        url = file_location.findtext('./{*}Url')
        if url and url.startswith('http://tlu.dl.delivery.mp.microsoft.com/'):
            return url
    return ''


def _build_link_request_envelope(url: str, guid: str) -> soap.Envelope:
    root = Element('GetExtendedUpdateInfo2')
    update_ids = SubElement(root, 'updateIDs')
    update_identity = SubElement(update_ids, 'UpdateIdentity')
    update_id = SubElement(update_identity, 'UpdateID')
    update_id.text = guid
    revision_number = SubElement(update_identity, 'RevisionNumber')
    revision_number.text = '1'
    info_types = SubElement(root, 'infoTypes')
    xml_update_fragment_type = SubElement(info_types, 'XmlUpdateFragmentType')
    xml_update_fragment_type.text = 'FileUrl'
    device_attributes = SubElement(root, 'deviceAttributes')
    device_attributes.text = 'E:BranchReadinessLevel=CBB&DchuNvidiaGrfxExists=1&ProcessorIdentifier=Intel64%20Family%206%20Model%2063%20Stepping%202&CurrentBranch=rs4_release&DataVer_RS5=1942&FlightRing=Retail&AttrDataVer=57&InstallLanguage=en-US&DchuAmdGrfxExists=1&OSUILocale=en-US&InstallationType=Client&FlightingBranchName=&Version_RS5=10&UpgEx_RS5=Green&GStatus_RS5=2&OSSkuId=48&App=WU&InstallDate=1529700913&ProcessorManufacturer=GenuineIntel&AppVer=10.0.17134.471&OSArchitecture=AMD64&UpdateManagementGroup=2&IsDeviceRetailDemo=0&HidOverGattReg=C%3A%5CWINDOWS%5CSystem32%5CDriverStore%5CFileRepository%5Chidbthle.inf_amd64_467f181075371c89%5CMicrosoft.Bluetooth.Profiles.HidOverGatt.dll&IsFlightingEnabled=0&DchuIntelGrfxExists=1&TelemetryLevel=1&DefaultUserRegion=244&DeferFeatureUpdatePeriodInDays=365&Bios=Unknown&WuClientVer=10.0.17134.471&PausedFeatureStatus=1&Steam=URL%3Asteam%20protocol&Free=8to16&OSVersion=10.0.17134.472&DeviceFamily=Windows.Desktop'  # noqa: E501

    return soap.Envelope(url, root)
